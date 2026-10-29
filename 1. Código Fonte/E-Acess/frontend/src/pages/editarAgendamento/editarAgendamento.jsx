import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function EditarAgendamento() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [agendamento, setAgendamento] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [mensagemErro, setMensagemErro] = useState("");
  const [mensagemSucesso, setMensagemSucesso] = useState("");

  // Busca os dados atuais do agendamento
  useEffect(() => {
    async function carregarAgendamento() {
      try {
        const resposta = await fetch(
          `http://localhost:8080/agendamentos/${id}`
        );

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
      [name]: value,
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
        placa: agendamento.placa,
        descricao: agendamento.descricao,
        status: agendamento.status,
        coleta: agendamento.coleta,
      };

      const resposta = await fetch(
        `http://localhost:8080/agendamentos/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dadosAtualizados),
        }
      );

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

  if (carregando) {
    return (
      <main className="editar-agendamento-container">
        <p>Carregando dados do agendamento...</p>
      </main>
    );
  }

  if (!agendamento) {
    return (
      <main className="editar-agendamento-container">
        <p className="editar-agendamento-erro" role="alert">
          {mensagemErro || "Agendamento não encontrado."}
        </p>

        <button
          type="button"
          className="editar-agendamento-voltar"
          onClick={() => navigate("/agendamentos")}
        >
          Voltar à página inicial
        </button>
      </main>
    );
  }

  return (
    <main className="editar-agendamento-container">
      <header className="editar-agendamento-cabecalho">
        <h1>Editar agendamento</h1>
        <p>
          Altere as informações desejadas e confirme para salvar.
        </p>
        <span>
          ID do agendamento: <strong>{agendamento.id}</strong>
        </span>
      </header>

      <form
        className="editar-agendamento-formulario"
        onSubmit={confirmarAgendamento}
      >
        <div className="editar-agendamento-grid">
          <div className="editar-agendamento-campo">
            <label htmlFor="data">Data</label>
            <input
              id="data"
              name="data"
              type="date"
              value={agendamento.data ?? ""}
              onChange={atualizarCampo}
              required
            />
          </div>

          <div className="editar-agendamento-campo">
            <label htmlFor="transportadora">Transportadora</label>
            <input
              id="transportadora"
              type="text"
              value={agendamento.transportadora?.nome ?? ""}
              readOnly
            />
          </div>

          <div className="editar-agendamento-campo">
            <label htmlFor="motorista">Motorista</label>
            <input
              id="motorista"
              type="text"
              value={agendamento.motorista?.nome ?? ""}
              readOnly
            />
          </div>

          <div className="editar-agendamento-campo">
            <label htmlFor="placa">Placa do veículo</label>
            <input
              id="placa"
              name="placa"
              type="text"
              maxLength={10}
              value={agendamento.placa ?? ""}
              onChange={atualizarCampo}
              required
            />
          </div>

          <div className="editar-agendamento-campo">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              value={agendamento.status ?? "PENDENTE"}
              onChange={atualizarCampo}
              required
            >
              <option value="PENDENTE">Pendente</option>
              <option value="ANDAMENTO">Andamento</option>
              <option value="CONCLUIDO">Concluído</option>
            </select>
          </div>

          <div className="editar-agendamento-campo">
            <label htmlFor="tipoAgendamento">Tipo de agendamento</label>
            <select
              id="tipoAgendamento"
              name="coleta"
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
            >
              <option value="false">Recebimento</option>
              <option value="true">Expedição</option>
            </select>
          </div>

          <div className="editar-agendamento-campo editar-agendamento-descricao">
            <label htmlFor="descricao">Descrição</label>
            <textarea
              id="descricao"
              name="descricao"
              rows={5}
              value={agendamento.descricao ?? ""}
              onChange={atualizarCampo}
              placeholder="Informe a descrição do agendamento"
            />
          </div>
        </div>

        {mensagemErro && (
          <p className="editar-agendamento-erro" role="alert">
            {mensagemErro}
          </p>
        )}

        {mensagemSucesso && (
          <p className="editar-agendamento-sucesso" role="status">
            {mensagemSucesso}
          </p>
        )}

        <div className="editar-agendamento-acoes">
          <button
            type="submit"
            className="editar-agendamento-confirmar"
            disabled={salvando}
          >
            {salvando ? "Salvando..." : "Atualizar Agendamento"}
          </button>

          <button
            type="button"
            className="editar-agendamento-voltar"
            onClick={() => navigate("/agendamentos")}
          >
            Voltar
          </button>
        </div>
      </form>
    </main>
  );
}

export default EditarAgendamento;