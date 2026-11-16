import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../components/navbar/navbar";
import SimularFrete, { ResumoFrete } from "../../components/simularFrete/simularFrete";
import "./editarAgendamento.css";

function EditarAgendamento() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [agendamento, setAgendamento] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [mensagemErro, setMensagemErro] = useState("");
  const [mensagemSucesso, setMensagemSucesso] = useState("");
  const [simulandoFrete, setSimulandoFrete] = useState(false);

  // Busca os dados atuais do agendamento
  useEffect(() => {
    async function carregarAgendamento() {
      try {
        const resposta = await fetch(`http://localhost:8080/agendamentos/${id}`);

        if (!resposta.ok) {
          throw new Error("Não foi possível encontrar o agendamento.");
        }

        const dados = await resposta.json();
        setAgendamento(dados);
      } catch (erro) {
        setMensagemErro(erro.message);
      } finally {
        setCarregando(false);
      }
    }

    carregarAgendamento();
  }, [id]);

  // Atualiza o campo alterado
  function atualizarCampo(event) {
    const { name, value } = event.target;

    setAgendamento((atual) => ({
      ...atual,
      [name]: name === "placa" ? value.toUpperCase() : value,
    }));

    setMensagemErro("");
    setMensagemSucesso("");
  }

  // Salva as alterações no agendamento existente
  async function confirmarAgendamento(event) {
    event.preventDefault();

    setSalvando(true);
    setMensagemErro("");
    setMensagemSucesso("");

    try {
      const dadosAtualizados = {
        data: agendamento.data,
        placa: agendamento.placa.trim().toUpperCase(),
        observacao: agendamento.observacao,
        status: agendamento.status,
        coleta: agendamento.coleta,
      };

      const resposta = await fetch(`http://localhost:8080/agendamentos/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dadosAtualizados),
      });

      if (!resposta.ok) {
        if (resposta.status === 404) {
          throw new Error("Agendamento não encontrado.");
        }

        throw new Error("Não foi possível salvar as alterações.");
      }

      const dadosSalvos = await resposta.json();

      setAgendamento(dadosSalvos);
      setMensagemSucesso("Agendamento atualizado com sucesso!");
    } catch (erro) {
      setMensagemErro(erro.message);
    } finally {
      setSalvando(false);
    }
  }

  // UC05 - passo 6: grava (ou substitui) o frete do agendamento
  async function vincularFrete(dadosFrete) {
    const resposta = await fetch(`http://localhost:8080/agendamentos/${id}/frete`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        peso: dadosFrete.peso,
        distancia: dadosFrete.distancia,
        dimensao: dadosFrete.dimensao,
      }),
    });

    if (!resposta.ok) {
      const corpo = await resposta.json().catch(() => ({}));
      throw new Error(corpo.mensagem ?? "Não foi possível vincular o frete.");
    }

    const dadosSalvos = await resposta.json();
    // Atualiza só o frete para não perder alterações ainda não salvas no formulário
    setAgendamento((atual) => ({ ...atual, frete: dadosSalvos.frete }));
    setSimulandoFrete(false);
    setMensagemErro("");
    setMensagemSucesso("Frete vinculado ao agendamento!");
  }

  function renderBadgeStatus(status) {
    const texto = String(status ?? "PENDENTE").replaceAll("_", " ");
    if (status === "CONCLUIDO") return <span className="badge bg-success">{texto}</span>;
    if (status === "ANDAMENTO") return <span className="badge bg-primary">{texto}</span>;
    return <span className="badge bg-warning text-dark">{texto}</span>;
  }

  return (
    <div className="editar-agendamento-wrapper min-vh-100 pb-4">
      <Navbar />

      <main className="container mt-4">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-9 col-xl-8">
            <section className="editar-agendamento-card p-4">
              {carregando ? (
                <div className="alert alert-info text-center mb-0">
                  Carregando dados do agendamento...
                </div>
              ) : !agendamento ? (
                <div className="text-center py-3">
                  <div className="alert alert-danger mb-3" role="alert">
                    {mensagemErro || "Agendamento não encontrado."}
                  </div>
                  <button
                    type="button"
                    className="btn editarAgendamento-btns px-4"
                    onClick={() => navigate("/agendamentos")}
                  >
                    Voltar à página inicial
                  </button>
                </div>
              ) : (
                <>
                  {/* CABEÇALHO */}
                  <header className="d-flex justify-content-between align-items-start flex-wrap gap-2 pb-3 mb-4 border-bottom">
                    <div>
                      <h1 className="editar-agendamento-title h2 mb-1 fw-bold">
                        Editar agendamento
                      </h1>
                      <p className="text-muted small mb-0">
                        Altere as informações desejadas e confirme para salvar.
                      </p>
                    </div>

                    <div className="d-flex align-items-center gap-2">
                      <span className="badge bg-secondary fs-6">
                        ID #{agendamento.id}
                      </span>
                      {renderBadgeStatus(agendamento.status)}
                    </div>
                  </header>

                  {/* FORMULÁRIO EM 2 COLUNAS */}
                  <form onSubmit={confirmarAgendamento}>
                    <div className="row g-3">
                      {/* COLUNA ESQUERDA */}
                      <div className="col-12 col-md-6 d-flex flex-column gap-3">
                        <div>
                          <label htmlFor="data" className="form-label fw-bold texto-azul-escuro mb-1">
                            Data
                          </label>
                          <input
                            id="data"
                            name="data"
                            type="date"
                            className="form-control campo-input"
                            value={agendamento.data ?? ""}
                            onChange={atualizarCampo}
                            required
                            disabled={salvando}
                          />
                        </div>

                        <div>
                          <label htmlFor="transportadora" className="form-label fw-bold texto-azul-escuro mb-1">
                            Transportadora
                          </label>
                          <input
                            id="transportadora"
                            type="text"
                            className="form-control campo-readonly"
                            value={agendamento.transportadora?.nome ?? ""}
                            readOnly
                            disabled
                          />
                        </div>

                        <div>
                          <label htmlFor="motorista" className="form-label fw-bold texto-azul-escuro mb-1">
                            Motorista
                          </label>
                          <input
                            id="motorista"
                            type="text"
                            className="form-control campo-readonly"
                            value={agendamento.motorista?.nome ?? ""}
                            readOnly
                            disabled
                          />
                        </div>

                        <div>
                          <label htmlFor="placa" className="form-label fw-bold texto-azul-escuro mb-1">
                            Placa do veículo
                          </label>
                          <input
                            id="placa"
                            name="placa"
                            type="text"
                            className="form-control campo-input"
                            maxLength={10}
                            value={agendamento.placa ?? ""}
                            onChange={atualizarCampo}
                            required
                            disabled={salvando}
                          />
                        </div>
                      </div>

                      {/* COLUNA DIREITA */}
                      <div className="col-12 col-md-6 d-flex flex-column gap-3">
                        <div className="row g-2">
                          <div className="col-12 col-sm-6">
                            <label htmlFor="status" className="form-label fw-bold texto-azul-escuro mb-1">
                              Status
                            </label>
                            <select
                              id="status"
                              name="status"
                              className="form-select campo-input"
                              value={agendamento.status ?? "PENDENTE"}
                              onChange={atualizarCampo}
                              required
                              disabled={salvando}
                            >
                              <option value="PENDENTE">Pendente</option>
                              <option value="ANDAMENTO">Andamento</option>
                              <option value="CONCLUIDO">Concluído</option>
                            </select>
                          </div>

                          <div className="col-12 col-sm-6">
                            <label htmlFor="tipoAgendamento" className="form-label fw-bold texto-azul-escuro mb-1">
                              Tipo
                            </label>
                            <select
                              id="tipoAgendamento"
                              name="coleta"
                              className="form-select campo-input"
                              value={String(agendamento.coleta)}
                              onChange={(event) => {
                                setAgendamento((atual) => ({
                                  ...atual,
                                  coleta: event.target.value === "true",
                                }));
                                setMensagemErro("");
                                setMensagemSucesso("");
                              }}
                              required
                              disabled={salvando}
                            >
                              <option value="false">Recebimento</option>
                              <option value="true">Expedição</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label htmlFor="observacao" className="form-label fw-bold texto-azul-escuro mb-1">
                            Observação
                          </label>
                          <textarea
                            id="observacao"
                            name="observacao"
                            className="form-control campo-input"
                            rows={4}
                            value={agendamento.observacao ?? ""}
                            onChange={atualizarCampo}
                            placeholder="Informe as observações do agendamento"
                            disabled={salvando}
                          />
                        </div>

                        {/* BOX FRETE (UC05) */}
                        <div className="frete-box p-3 rounded-3 d-flex flex-column gap-2">
                          <label className="form-label fw-bold texto-azul-escuro mb-0">
                            Frete
                          </label>
                          {agendamento.frete ? (
                            <ResumoFrete frete={agendamento.frete} />
                          ) : (
                            <small className="text-muted">Nenhum frete vinculado.</small>
                          )}
                          <div>
                            <button
                              type="button"
                              className="btn btn-sm editarAgendamento-btns"
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
                        onClick={() => navigate("/agendamentos")}
                        disabled={salvando}
                      >
                        Voltar
                      </button>

                      <button
                        type="submit"
                        className="btn editarAgendamento-btns px-4"
                        disabled={salvando}
                      >
                        {salvando ? "Salvando..." : "Atualizar Agendamento"}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </section>
          </div>
        </div>
      </main>

      {simulandoFrete && (
        <SimularFrete
          freteAtual={agendamento.frete}
          aoConfirmar={vincularFrete}
          aoFechar={() => setSimulandoFrete(false)}
        />
      )}
    </div>
  );
}

export default EditarAgendamento;