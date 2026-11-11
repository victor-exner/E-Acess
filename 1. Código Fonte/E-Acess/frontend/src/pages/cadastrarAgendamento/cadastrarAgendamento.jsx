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
        const [
          respostaTransportadoras,
          respostaMotoristas,
        ] = await Promise.all([
          fetch("http://localhost:8080/transportadoras"),
          fetch("http://localhost:8080/motoristas"),
        ]);

        if (
          !respostaTransportadoras.ok ||
          !respostaMotoristas.ok
        ) {
          throw new Error(
            "Não foi possível carregar as transportadoras e os motoristas."
          );
        }

        const dadosTransportadoras =
          await respostaTransportadoras.json();

        const dadosMotoristas =
          await respostaMotoristas.json();

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
      const resposta = await fetch(
        "http://localhost:8080/agendamentos",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(novoAgendamento),
        }
      );

      if (!resposta.ok) {
        throw new Error(
          "Não foi possível cadastrar o agendamento."
        );
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

      setMensagemSucesso(
        "Agendamento cadastrado com sucesso!"
      );

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
    <main className="novo-agendamento-container">
      <Navbar/>
      <section className="novo-agendamento-card">

        <header className="novo-agendamento-cabecalho">
          <div>
            <h1 className="novo-agendamento-title">Novo agendamento</h1>
          </div>
        </header>

        {/* Exibindo campos de cadastro de agendamento */}
        {carregando ? (
          <p className="novo-agendamento-carregando">
            Carregando transportadoras e motoristas...
          </p>
        ) : (
          
          // INICIO FORMULARIO DE CADASTRO DE AGENDAMENTO
          <form className="novo-agendamento-form" onSubmit={salvarAgendamento}>
            
            <div className="row1">
              {/* CAMPO DATA */}
              <div className="novo-agendamento-campo">
                <label htmlFor="data-agendamento">Data do agendamento</label>

                <input
                  type="date" id="data-agendamento" value={data}
                  onChange={(event) => setData(event.target.value)}
                  required disabled={salvando}/>
              </div>

              {/* CAMPO TRANSPORTADORA */}
              <div className="novo-agendamento-campo">
                <label htmlFor="transportadora-agendamento">Transportadora</label>

                <select
                  id="transportadora-agendamento" value={transportadoraId}
                  onChange={(event) =>
                  setTransportadoraId(event.target.value)}
                  required disabled={salvando}>
                  <option value="">Selecione uma transportadora</option>

                  {transportadoras.map((transportadora) => (
                    <option key={transportadora.id} value={transportadora.id}>
                      {transportadora.nome}
                    </option>))}
                </select>
              </div>

              {/* CAMPO MOTORISTA */}
              <div className="novo-agendamento-campo">
                <label htmlFor="motorista-agendamento">Motorista</label>

                <select
                  id="motorista-agendamento" value={motoristaId}
                  onChange={(event) =>
                  setMotoristaId(event.target.value)}
                  required disabled={salvando}>

                  <option value="">Selecione um motorista</option>

                  {motoristas.map((motorista) => (
                    <option key={motorista.id} value={motorista.id}>
                      {motorista.nome}
                    </option>))}
                </select>

                <button
                  type="button"
                  className="novoAgendamento-btns"
                  style={{ marginTop: "6px", fontSize: "0.8rem", padding: "4px 8px" }}
                  onClick={() => setGerenciandoMotorista(true)}
                  disabled={salvando}>
                  Gerenciar motoristas
                </button>
              </div>

              {/* CAMPO PLACA */}
              <div className="novo-agendamento-campo">
                <label htmlFor="placa-agendamento">Placa do veículo</label>

                <input
                  type="text" id="placa-agendamento"
                  placeholder="Ex.: ABC1D23" value={placa}
                  onChange={(event) =>
                  setPlaca(event.target.value.toUpperCase())}
                  maxLength={10} required disabled={salvando}/>
              </div>
            </div>

            <div className="row2">
              {/* CAMPO TIPO AGENDAMENTO */}
              <div className="novo-agendamento-campo">
                <label htmlFor="tipo-agendamento">Tipo do agendamento</label>

                <select
                  id="tipo-agendamento"
                  value={tipoAgendamento}
                  onChange={(event) => setTipoAgendamento(event.target.value)}
                  required disabled={salvando}>

                  <option value="">Selecione o tipo do agendamento</option>
                  <option value="recebimento">Recebimento</option>
                  <option value="expedicao">Expedição</option>
                </select>
              </div>

              {/* CAMPO STATUS */}
              <div className="novo-agendamento-status">
                <label htmlFor="">Status Inicial: </label><p>Pendente</p>
              </div>

              {/* CAMPO DESCRIÇÃO */}
              <div className="novo-agendamento-campo">
                <label htmlFor="observacao-agendamento">Descrição</label>

                <textarea
                  id="observacao-agendamento"
                  value={observacao}
                  onChange={(event) => setObservacao(event.target.value)}
                  placeholder="Descreva os detalhes do agendamento..."
                  rows={7} maxLength={2000} disabled={salvando}/>
              </div>

              {/* CAMPO FRETE (UC05 - Simular Frete) */}
              <div className="agendamento-frete">
                <label>Frete</label>
                {frete ? (
                  <>
                    <ResumoFrete frete={frete}/>
                    <small>Será gravado ao salvar o agendamento.</small>
                  </>
                ) : (
                  <small>Nenhum frete vinculado.</small>
                )}
                <button type="button" className="novoAgendamento-btns"
                  onClick={() => { setMensagemSucesso(""); setSimulandoFrete(true); }}
                  disabled={salvando}>
                  Simular frete
                </button>
              </div>
            </div>

            {/* CAMPO MENSAGENS DE RETORNO */}
            {mensagemErro && (
              <p className="novo-agendamento-erro" role="alert">
                {mensagemErro}
              </p>
            )}

            {mensagemSucesso && (
              <p className="novo-agendamento-sucesso" role="status">
                {mensagemSucesso}
              </p>
            )}

            {/* CAMPO BOTÕES */}
            <div className="novoAgendamento-btns-container">
              <button type="button" className="novoAgendamento-btns"  
                onClick={cancelarCadastro}
                disabled={salvando}>
                Cancelar
              </button>

              <button type="submit" className="novoAgendamento-btns"         
                disabled={salvando}>
                {salvando ? "Salvando..." : "Salvar agendamento"}
              </button>
            </div>

          </form>
        )}
      </section>

      {simulandoFrete && (
        <SimularFrete
          freteAtual={frete}
          aoConfirmar={vincularFrete}
          aoFechar={() => setSimulandoFrete(false)}/>
      )}

      {gerenciandoMotorista && (
        <ManterMotoristaModal
          aoFechar={() => setGerenciandoMotorista(false)}
          aoSelecionarMotorista={vincularMotorista}/>
      )}
    </main>
  );
}

export default CadastrarAgendamento;