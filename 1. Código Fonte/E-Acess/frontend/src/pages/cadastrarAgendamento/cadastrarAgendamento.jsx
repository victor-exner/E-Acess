import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/navbar/navbar";
import SimularFrete, { ResumoFrete } from "../../components/simularFrete/simularFrete";
import "./cadastrarAgendamentos.css";
import ManterMotoristaModal from "../../components/modal/manterMotorista/manterMotorista";

function CadastrarAgendamento() {
  const navigate = useNavigate();

  const [tipoAgendamento, setTipoAgendamento] = useState("");
  const [data, setData] = useState("");
  const [transportadoraId, setTransportadoraId] = useState("");
  const [motoristaId, setMotoristaId] = useState("");
  const [placa, setPlaca] = useState("");
  const [observacao, setObservacao] = useState("");

  // UC05 - frete simulado (vinculado logo depois que o agendamento é salvo)
  const [frete, setFrete] = useState(null);
  const [simulandoFrete, setSimulandoFrete] = useState(false);

  // UC03 - controle do modal de motoristas
  const [gerenciandoMotorista, setGerenciandoMotorista] = useState(false);

  const [transportadoras, setTransportadoras] = useState([]);
  const [motoristas, setMotoristas] = useState([]);

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const [mensagemErro, setMensagemErro] = useState("");
  const [mensagemSucesso, setMensagemSucesso] = useState("");

  // Carrega as transportadoras e os motoristas
  useEffect(() => {
    async function carregarOpcoes() {
      try {
        const [respostaTransportadoras, respostaMotoristas] = await Promise.all([
          fetch("http://localhost:8080/transportadoras"),
          fetch("http://localhost:8080/motoristas"),
        ]);

        if (!respostaTransportadoras.ok || !respostaMotoristas.ok) {
          throw new Error(
            "Não foi possível carregar as transportadoras e os motoristas."
          );
        }

        const dadosTransportadoras = await respostaTransportadoras.json();
        const dadosMotoristas = await respostaMotoristas.json();

        setTransportadoras(dadosTransportadoras);
        setMotoristas(dadosMotoristas);
      } catch (erro) {
        setMensagemErro(
          "Erro ao carregar os dados. Verifique o backend e a configuração de CORS."
        );
      } finally {
        setCarregando(false);
      }
    }

    carregarOpcoes();
  }, []);

  // Cadastra o agendamento
  async function salvarAgendamento(event) {
    event.preventDefault();

    setSalvando(true);
    setMensagemErro("");
    setMensagemSucesso("");

    const novoAgendamento = {
      data: data,
      transportadora: {
        id: Number(transportadoraId),
      },
      motorista: {
        id: Number(motoristaId),
      },
      placa: placa.trim().toUpperCase(),
      status: "PENDENTE",
      coleta: tipoAgendamento === "expedicao",
      observacao: observacao.trim(),
    };

    try {
      const resposta = await fetch("http://localhost:8080/agendamentos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(novoAgendamento),
      });

      if (!resposta.ok) {
        throw new Error("Não foi possível cadastrar o agendamento.");
      }

      // UC05 - passo 6: vincula o frete simulado ao agendamento recém-criado.
      if (frete) {
        const agendamentoSalvo = await resposta.json();
        const respostaFrete = await fetch(
          `http://localhost:8080/agendamentos/${agendamentoSalvo.id}/frete`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              peso: frete.peso,
              distancia: frete.distancia,
              dimensao: frete.dimensao,
            }),
          }
        );

        if (!respostaFrete.ok) {
          const corpo = await respostaFrete.json().catch(() => ({}));
          throw new Error(
            "Agendamento cadastrado, mas o frete não foi vinculado: " +
              (corpo.mensagem ?? "erro inesperado") +
              ". Vincule o frete pela tela de edição."
          );
        }
      }

      setMensagemSucesso("Agendamento cadastrado com sucesso!");

      setTimeout(() => {
        navigate("/agendamentos");
      }, 1000);
    } catch (erro) {
      setMensagemErro(erro.message);
    } finally {
      setSalvando(false);
    }
  }

  // UC05 - passo 6: vincula frete
  function vincularFrete(dadosFrete) {
    setFrete(dadosFrete);
    setSimulandoFrete(false);
    setMensagemErro("");
    setMensagemSucesso("Frete vinculado ao agendamento!");
  }

  // UC03 - RN05: atualiza a lista e seleciona o motorista recém-criado/escolhido no formulário
  function vincularMotorista(novoMotorista) {
    setMotoristas((atuais) => {
      const existe = atuais.some((m) => m.id === novoMotorista.id);
      return existe
        ? atuais.map((m) => (m.id === novoMotorista.id ? novoMotorista : m))
        : [...atuais, novoMotorista];
    });
    setMotoristaId(String(novoMotorista.id));
  }

  // Volta para a página anterior
  function cancelarCadastro() {
    navigate("/agendamentos");
  }

  return (
    <div className="novo-agendamento-wrapper min-vh-100 pb-4">
      <Navbar />

      <main className="container mt-4">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-9 col-xl-8">
            <section className="novo-agendamento-card p-4">
              <header className="d-flex justify-content-between align-items-center pb-3 mb-4 border-bottom">
                <h1 className="novo-agendamento-title h2 mb-0 fw-bold">
                  Novo agendamento
                </h1>
                <div>
                  <span className="fw-bold texto-azul-escuro me-2">Status Inicial:</span>
                  <span className="badge bg-warning text-dark">Pendente</span>
                </div>
              </header>

              {carregando ? (
                <div className="alert alert-info text-center mb-0">
                  Carregando transportadoras e motoristas...
                </div>
              ) : (
                <form onSubmit={salvarAgendamento}>
                  <div className="row g-3">
                    {/* COLUNA ESQUERDA */}
                    <div className="col-12 col-md-6 d-flex flex-column gap-3">
                      <div>
                        <label htmlFor="data-agendamento" className="form-label fw-bold texto-azul-escuro mb-1">
                          Data do agendamento
                        </label>
                        <input
                          type="date"
                          id="data-agendamento"
                          className="form-control campo-input"
                          value={data}
                          onChange={(event) => setData(event.target.value)}
                          required
                          disabled={salvando}
                        />
                      </div>

                      <div>
                        <label htmlFor="transportadora-agendamento" className="form-label fw-bold texto-azul-escuro mb-1">
                          Transportadora
                        </label>
                        <select
                          id="transportadora-agendamento"
                          className="form-select campo-input"
                          value={transportadoraId}
                          onChange={(event) => setTransportadoraId(event.target.value)}
                          required
                          disabled={salvando}
                        >
                          <option value="">Selecione uma transportadora</option>
                          {transportadoras.map((transportadora) => (
                            <option key={transportadora.id} value={transportadora.id}>
                              {transportadora.nome}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label htmlFor="motorista-agendamento" className="form-label fw-bold texto-azul-escuro mb-1">
                          Motorista
                        </label>
                        <select
                          id="motorista-agendamento"
                          className="form-select campo-input"
                          value={motoristaId}
                          onChange={(event) => setMotoristaId(event.target.value)}
                          required
                          disabled={salvando}
                        >
                          <option value="">Selecione um motorista</option>
                          {motoristas.map((motorista) => (
                            <option key={motorista.id} value={motorista.id}>
                              {motorista.nome}
                            </option>
                          ))}
                        </select>

                        <button
                          type="button"
                          className="btn btn-sm novoAgendamento-btns mt-2"
                          onClick={() => setGerenciandoMotorista(true)}
                          disabled={salvando}
                        >
                          Gerenciar motoristas
                        </button>
                      </div>

                      <div>
                        <label htmlFor="placa-agendamento" className="form-label fw-bold texto-azul-escuro mb-1">
                          Placa do veículo
                        </label>
                        <input
                          type="text"
                          id="placa-agendamento"
                          className="form-control campo-input"
                          placeholder="Ex.: ABC1D23"
                          value={placa}
                          onChange={(event) => setPlaca(event.target.value.toUpperCase())}
                          maxLength={10}
                          required
                          disabled={salvando}
                        />
                      </div>
                    </div>

                    {/* COLUNA DIREITA */}
                    <div className="col-12 col-md-6 d-flex flex-column gap-3">
                      <div>
                        <label htmlFor="tipo-agendamento" className="form-label fw-bold texto-azul-escuro mb-1">
                          Tipo do agendamento
                        </label>
                        <select
                          id="tipo-agendamento"
                          className="form-select campo-input"
                          value={tipoAgendamento}
                          onChange={(event) => setTipoAgendamento(event.target.value)}
                          required
                          disabled={salvando}
                        >
                          <option value="">Selecione o tipo do agendamento</option>
                          <option value="recebimento">Recebimento</option>
                          <option value="expedicao">Expedição</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="observacao-agendamento" className="form-label fw-bold texto-azul-escuro mb-1">
                          Descrição
                        </label>
                        <textarea
                          id="observacao-agendamento"
                          className="form-control campo-input"
                          value={observacao}
                          onChange={(event) => setObservacao(event.target.value)}
                          placeholder="Descreva os detalhes do agendamento..."
                          rows={5}
                          maxLength={2000}
                          disabled={salvando}
                        />
                      </div>

                      {/* BOX FRETE (UC05) */}
                      <div className="frete-box p-3 rounded-3 d-flex flex-column gap-2">
                        <label className="form-label fw-bold texto-azul-escuro mb-0">
                          Frete
                        </label>
                        {frete ? (
                          <>
                            <ResumoFrete frete={frete} />
                            <small className="text-muted">
                              Será gravado ao salvar o agendamento.
                            </small>
                          </>
                        ) : (
                          <small className="text-muted">Nenhum frete vinculado.</small>
                        )}
                        <div>
                          <button
                            type="button"
                            className="btn btn-sm novoAgendamento-btns"
                            onClick={() => {
                              setMensagemSucesso("");
                              setSimulandoFrete(true);
                            }}
                            disabled={salvando}
                          >
                            Simular frete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* MENSAGENS DE RETORNO */}
                  {mensagemErro && (
                    <div className="alert alert-danger mt-4 mb-0 py-2 text-center" role="alert">
                      {mensagemErro}
                    </div>
                  )}

                  {mensagemSucesso && (
                    <div className="alert alert-success mt-4 mb-0 py-2 text-center" role="status">
                      {mensagemSucesso}
                    </div>
                  )}

                  {/* BOTÕES DE AÇÃO */}
                  <div className="d-flex justify-content-center gap-3 mt-4 pt-3 border-top">
                    <button
                      type="button"
                      className="btn btn-outline-secondary fw-bold px-4"
                      onClick={cancelarCadastro}
                      disabled={salvando}
                    >
                      Cancelar
                    </button>

                    <button
                      type="submit"
                      className="btn novoAgendamento-btns px-4"
                      disabled={salvando}
                    >
                      {salvando ? "Salvando..." : "Salvar agendamento"}
                    </button>
                  </div>
                </form>
              )}
            </section>
          </div>
        </div>
      </main>

      {simulandoFrete && (
        <SimularFrete
          freteAtual={frete}
          aoConfirmar={vincularFrete}
          aoFechar={() => setSimulandoFrete(false)}
        />
      )}

      {gerenciandoMotorista && (
        <ManterMotoristaModal
          aoFechar={() => setGerenciandoMotorista(false)}
          aoSelecionarMotorista={vincularMotorista}
        />
      )}
    </div>
  );
}

export default CadastrarAgendamento;