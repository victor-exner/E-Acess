import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function CadastrarAgendamento() {
  const navigate = useNavigate();

  const [tipoAgendamento, setTipoAgendamento] = useState("");
  const [data, setData] = useState("");
  const [transportadoraId, setTransportadoraId] = useState("");
  const [motoristaId, setMotoristaId] = useState("");
  const [placa, setPlaca] = useState("");
  const [frete, setFrete] = useState("");

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
      coleta: tipoAgendamento === "expedicao"
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

      setMensagemSucesso(
        "Agendamento cadastrado com sucesso!"
      );

      // Aguarda um instante para exibir a mensagem
      setTimeout(() => {
        navigate("/agendamentos");
      }, 1000);
    } catch (erro) {
      setMensagemErro(erro.message);
    } finally {
      setSalvando(false);
    }
  }

  // Volta para a página anterior
  function cancelarCadastro() {
    navigate("/agendamentos");
  }

  return (
    <main className="novo-agendamento-pagina">
      <section className="novo-agendamento-container">

        <header className="novo-agendamento-cabecalho">
          <div>
            <h1>Novo agendamento</h1>

            <p>
              Preencha os campos abaixo para cadastrar um novo agendamento.
            </p>
          </div>

          <button
            type="button"
            className="novo-agendamento-voltar"
            onClick={cancelarCadastro}
          >
            Voltar
          </button>
        </header>

        {carregando ? (
          <p className="novo-agendamento-carregando">
            Carregando transportadoras e motoristas...
          </p>
        ) : (
          <form
            className="novo-agendamento-formulario"
            onSubmit={salvarAgendamento}
          >
            <div className="novo-agendamento-campo">
              <label htmlFor="data-agendamento">
                Data do agendamento
              </label>

              <input
                type="date"
                id="data-agendamento"
                value={data}
                onChange={(event) => setData(event.target.value)}
                required
                disabled={salvando}
              />
            </div>

            <div className="novo-agendamento-campo">
              <label htmlFor="transportadora-agendamento">
                Transportadora
              </label>

              <select
                id="transportadora-agendamento"
                value={transportadoraId}
                onChange={(event) =>
                  setTransportadoraId(event.target.value)
                }
                required
                disabled={salvando}
              >
                <option value="">
                  Selecione uma transportadora
                </option>

                {transportadoras.map((transportadora) => (
                  <option
                    key={transportadora.id}
                    value={transportadora.id}
                  >
                    {transportadora.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="novo-agendamento-campo">
              <label htmlFor="motorista-agendamento">
                Motorista
              </label>

              <select
                id="motorista-agendamento"
                value={motoristaId}
                onChange={(event) =>
                  setMotoristaId(event.target.value)
                }
                required
                disabled={salvando}
              >
                <option value="">
                  Selecione um motorista
                </option>

                {motoristas.map((motorista) => (
                  <option
                    key={motorista.id}
                    value={motorista.id}
                  >
                    {motorista.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="novo-agendamento-campo">
              <label htmlFor="placa-agendamento">
                Placa do veículo
              </label>

              <input
                type="text"
                id="placa-agendamento"
                placeholder="Ex.: ABC1D23"
                value={placa}
                onChange={(event) =>
                  setPlaca(event.target.value.toUpperCase())
                }
                maxLength={10}
                required
                disabled={salvando}
              />
            </div>

            <div className="novo-agendamento-campo">
              <label htmlFor="tipo-agendamento">
                Tipo do agendamento
              </label>

              <select
                id="tipo-agendamento"
                value={tipoAgendamento}
                onChange={(event) =>
                  setTipoAgendamento(event.target.value)
                }
                required
                disabled={salvando}
              >
                <option value="">
                  Selecione o tipo do agendamento
                </option>

                <option value="recebimento">
                  Recebimento
                </option>

                <option value="expedicao">
                  Expedição
                </option>
              </select>
            </div>

            <div className="novo-agendamento-status">
              Status inicial: <strong>Pendente</strong>
            </div>

            
            {mensagemErro && (
              <p
                className="novo-agendamento-erro"
                role="alert"
              >
                {mensagemErro}
              </p>
            )}

            {mensagemSucesso && (
              <p
                className="novo-agendamento-sucesso"
                role="status"
              >
                {mensagemSucesso}
              </p>
            )}

            <div className="novo-agendamento-acoes">
              <button
                type="button"
                className="novo-agendamento-cancelar"
                onClick={cancelarCadastro}
                disabled={salvando}
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="novo-agendamento-salvar"
                disabled={salvando}
              >
                {salvando
                  ? "Salvando..."
                  : "Salvar agendamento"}
              </button>
            </div>
          </form>
        )}
      </section>
    </main>
  );
}

export default CadastrarAgendamento;