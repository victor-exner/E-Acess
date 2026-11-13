import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/navbar/navbar";
import "./agendamentos.css";

function Agendamentos() {
  const navigate = useNavigate();

  const [agendamentos, setAgendamentos] = useState([]);
  const [agendamentosFiltrados, setAgendamentosFiltrados] = useState([]);

  const [filtros, setFiltros] = useState({
    id: "",
    data: "",
    transportadora: "",
    motorista: "",
    placa: "",
    tipoAgendamento: "",
    status: ""
  });

  const [carregando, setCarregando] = useState(true);
  const [mensagemErro, setMensagemErro] = useState("");

  useEffect(() => {
    async function carregarAgendamentos() {
      try {
        const resposta = await fetch("http://localhost:8080/agendamentos");

        if (!resposta.ok) {
          throw new Error("Não foi possível carregar os agendamentos!");
        }

        const dados = await resposta.json();
        setAgendamentos(dados);
        setAgendamentosFiltrados(dados);
      } catch (erro) {
        setMensagemErro("Não foi possível carregar os agendamentos!");
      } finally {
        setCarregando(false);
      }
    }
    carregarAgendamentos();
  }, []);

  function atualizarFiltro(event) {
    const { name, value } = event.target;
    setFiltros((filtrosAtuais) => ({
      ...filtrosAtuais,
      [name]: value,
    }));
  }

  function filtrarAgendamentos(event) {
    event.preventDefault();

    const resultados = agendamentos.filter((agendamento) => {
      const correspondeId = String(agendamento.id).includes(filtros.id.trim());
      const correspondeData = String(agendamento.data ?? "").includes(filtros.data.trim());
      const correspondeTransportadora = String(agendamento.transportadora?.nome ?? "")
        .toLowerCase()
        .includes(filtros.transportadora.trim().toLowerCase());
      const correspondeMotorista = String(agendamento.motorista?.nome ?? "")
        .toLowerCase()
        .includes(filtros.motorista.trim().toLowerCase());
      const correspondePlaca = String(agendamento.placa ?? "")
        .toLowerCase()
        .includes(filtros.placa.trim().toLowerCase());
      const correspondeStatus =
        filtros.status === "" || agendamento.status === filtros.status;
      const correspondeTipo =
        filtros.tipoAgendamento === "" ||
        (filtros.tipoAgendamento === "expedicao" && agendamento.coleta === true) ||
        (filtros.tipoAgendamento === "recebimento" && agendamento.coleta === false);

      return (
        correspondeId &&
        correspondeData &&
        correspondeTransportadora &&
        correspondeMotorista &&
        correspondePlaca &&
        correspondeTipo &&
        correspondeStatus
      );
    });

    setAgendamentosFiltrados(resultados);
  }

  function limparFiltros() {
    setFiltros({
      id: "",
      data: "",
      transportadora: "",
      motorista: "",
      placa: "",
      tipoAgendamento: "",
      status: ""
    });
    setAgendamentosFiltrados(agendamentos);
  }

  function renderBadgeStatus(status) {
    const texto = String(status ?? "—").replaceAll("_", " ");
    if (status === "CONCLUIDO") return <span className="badge bg-success">{texto}</span>;
    if (status === "ANDAMENTO") return <span className="badge bg-primary">{texto}</span>;
    if (status === "PENDENTE") return <span className="badge bg-warning text-dark">{texto}</span>;
    return <span className="badge bg-secondary">{texto}</span>;
  }

  return (
    <div className="agendamentos-wrapper min-vh-100 pb-4">
      <Navbar />

      <main className="container mt-4">
        <div className="container-principal p-4">
          {/* Cabeçalho com Flexbox */}
          <header className="d-flex justify-content-between align-items-center flex-wrap gap-3 pb-3 border-bottom">
            <h1 className="agendamentos-title h2 mb-0 fw-bold">Agendamentos</h1>

            <button
              type="button"
              className="btn btn-novo-agendamento px-4"
              onClick={() => navigate("/cadastrar-agendamento")}
            >
              + Novo agendamento
            </button>
          </header>

          {/* Filtros usando CSS Grid */}
          <section className="py-3">
            <form onSubmit={filtrarAgendamentos}>
              <div className="filtros-grid">
                <div>
                  <label htmlFor="filtro-id" className="form-label fw-bold texto-azul-escuro mb-1">
                    ID
                  </label>
                  <input
                    id="filtro-id"
                    name="id"
                    type="text"
                    inputMode="numeric"
                    className="form-control form-control-sm filtro-input"
                    placeholder="ID"
                    value={filtros.id}
                    onChange={atualizarFiltro}
                  />
                </div>

                <div>
                  <label htmlFor="filtro-data" className="form-label fw-bold texto-azul-escuro mb-1">
                    Data
                  </label>
                  <input
                    id="filtro-data"
                    name="data"
                    type="date"
                    className="form-control form-control-sm filtro-input"
                    value={filtros.data}
                    onChange={atualizarFiltro}
                  />
                </div>

                <div>
                  <label htmlFor="filtro-transportadora" className="form-label fw-bold texto-azul-escuro mb-1">
                    Transportadora
                  </label>
                  <input
                    id="filtro-transportadora"
                    name="transportadora"
                    type="text"
                    className="form-control form-control-sm filtro-input"
                    placeholder="Transportadora"
                    value={filtros.transportadora}
                    onChange={atualizarFiltro}
                  />
                </div>

                <div>
                  <label htmlFor="filtro-motorista" className="form-label fw-bold texto-azul-escuro mb-1">
                    Motorista
                  </label>
                  <input
                    id="filtro-motorista"
                    name="motorista"
                    type="text"
                    className="form-control form-control-sm filtro-input"
                    placeholder="Motorista"
                    value={filtros.motorista}
                    onChange={atualizarFiltro}
                  />
                </div>

                <div>
                  <label htmlFor="filtro-placa" className="form-label fw-bold texto-azul-escuro mb-1">
                    Placa
                  </label>
                  <input
                    id="filtro-placa"
                    name="placa"
                    type="text"
                    className="form-control form-control-sm filtro-input"
                    placeholder="Placa"
                    value={filtros.placa}
                    onChange={atualizarFiltro}
                  />
                </div>

                <div>
                  <label htmlFor="filtro-tipo-agendamento" className="form-label fw-bold texto-azul-escuro mb-1">
                    Tipo
                  </label>
                  <select
                    id="filtro-tipo-agendamento"
                    name="tipoAgendamento"
                    className="form-select form-select-sm filtro-input"
                    value={filtros.tipoAgendamento}
                    onChange={atualizarFiltro}
                  >
                    <option value="">Todos</option>
                    <option value="expedicao">Expedição</option>
                    <option value="recebimento">Recebimento</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="filtro-status" className="form-label fw-bold texto-azul-escuro mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    id="filtro-status"
                    className="form-select form-select-sm filtro-input"
                    value={filtros.status}
                    onChange={atualizarFiltro}
                  >
                    <option value="">Todos</option>
                    <option value="ANDAMENTO">Andamento</option>
                    <option value="PENDENTE">Pendente</option>
                    <option value="CONCLUIDO">Concluído</option>
                  </select>
                </div>

                {/* Botões alinhados com Flexbox */}
                <div className="d-flex align-items-end gap-2">
                  <button type="submit" className="btn btn-sm filtro-btn flex-fill">
                    Filtrar
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm filtro-btn flex-fill"
                    onClick={limparFiltros}
                  >
                    Limpar
                  </button>
                </div>
              </div>
            </form>
          </section>

          {/* Listagem com Tabela Bootstrap */}
          <section className="mt-2">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-muted fw-semibold small">
                {agendamentosFiltrados.length} registro(s) encontrado(s)
              </span>
            </div>

            {carregando ? (
              <div className="alert alert-info text-center mb-0">
                Carregando agendamentos...
              </div>
            ) : mensagemErro ? (
              <div className="alert alert-danger text-center mb-0" role="alert">
                {mensagemErro}
              </div>
            ) : agendamentosFiltrados.length === 0 ? (
              <div className="alert alert-secondary text-center mb-0">
                Nenhum agendamento encontrado com os filtros informados.
              </div>
            ) : (
              <div className="table-responsive agendamentos-tabela-scroll rounded-3 border border-2 border-primary-subtle">
                <table className="table table-hover align-middle mb-0 agendamentos-tabela">
                  <thead className="tabela-cabecalho sticky-top">
                    <tr>
                      <th className="ps-3">ID</th>
                      <th>Data</th>
                      <th>Transportadora</th>
                      <th>Motorista</th>
                      <th>Placa</th>
                      <th>Tipo</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agendamentosFiltrados.map((agendamento) => (
                      <tr
                        key={agendamento.id}
                        className="agendamento-linha"
                        onClick={() => navigate(`/editar-agendamento/${agendamento.id}`)}
                      >
                        <td className="ps-3 fw-bold">{agendamento.id}</td>
                        <td>{agendamento.data || "—"}</td>
                        <td>{agendamento.transportadora?.nome || "—"}</td>
                        <td>{agendamento.motorista?.nome || "—"}</td>
                        <td>{agendamento.placa || "—"}</td>
                        <td>
                          {agendamento.coleta === true
                            ? "Expedição"
                            : agendamento.coleta === false
                            ? "Recebimento"
                            : "—"}
                        </td>
                        <td>{renderBadgeStatus(agendamento.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default Agendamentos;