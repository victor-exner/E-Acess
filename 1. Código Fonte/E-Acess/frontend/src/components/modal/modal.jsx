import { useEffect, useState } from "react";
import "./modal.css";

function Modal({ onClose, onSalvo }) {
  const [data, setData] = useState("");
  const [transportadoraId, setTransportadoraId] = useState("");
  const [motoristaId, setMotoristaId] = useState("");
  const [placa, setPlaca] = useState("");

  const [transportadoras, setTransportadoras] = useState([]);
  const [motoristas, setMotoristas] = useState([]);

  const [salvando, setSalvando] = useState(false);
  const [mensagemErro, setMensagemModalErro] = useState("");

  // Puxando as transportadoras e os motoristas existentes ao abrir o modal
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
        setMensagemModalErro(erro.message);
      }
    }

    carregarOpcoes();
  }, []);

  // Salvando um novo agendamento
  async function salvarAgendamento(event) {
    event.preventDefault();

    setSalvando(true);
    setMensagemModalErro("");

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

      // Atualiza a lista da página de agendamentos
      await onSalvo();

      // Fecha o modal após o sucesso
      onClose();
    } catch (erro) {
      setMensagemModalErro(erro.message);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div
      className="modal-agendamento-overlay"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget &&
          !salvando
        ) {
          onClose();
        }
      }}
    >
      <section
        className="modal-agendamento"
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-modal-agendamento"
      >
        <div className="modal-agendamento-cabecalho">
          <h2 id="titulo-modal-agendamento">
            Novo agendamento
          </h2>

          <button
            type="button"
            className="modal-agendamento-fechar"
            onClick={onClose}
            disabled={salvando}
            aria-label="Fechar modal"
          >
            &times;
          </button>
        </div>

        <form
          className="modal-agendamento-formulario"
          onSubmit={salvarAgendamento}
        >
          {/* Campo de data */}
          <div className="modal-agendamento-campo">
            <label htmlFor="data-agendamento">
              Data
            </label>

            <input
              type="date"
              id="data-agendamento"
              value={data}
              onChange={(event) =>
                setData(event.target.value)
              }
              required
              disabled={salvando}
            />
          </div>

          {/* Campo de transportadora */}
          <div className="modal-agendamento-campo">
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

          {/* Campo de motorista */}
          <div className="modal-agendamento-campo">
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

          {/* Campo de placa */}
          <div className="modal-agendamento-campo">
            <label htmlFor="placa-agendamento">
              Placa
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

          {/* Status padrão */}
          <p className="modal-agendamento-status">
            Status inicial: <strong>Pendente</strong>
          </p>

          {/* Mensagem de erro */}
          {mensagemErro && (
            <p
              className="modal-agendamento-erro"
              role="alert"
            >
              {mensagemErro}
            </p>
          )}

          {/* Botões */}
          <div className="modal-agendamento-acoes">
            <button
              type="button"
              className="modal-agendamento-cancelar"
              onClick={onClose}
              disabled={salvando}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="modal-agendamento-salvar"
              disabled={salvando}
            >
              {salvando
                ? "Salvando..."
                : "Salvar agendamento"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default Modal;
