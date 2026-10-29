import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/navbar/navbar";
import "./agendamentos.css";

function Agendamentos() {
  // Constante para inicializar o Navigate
  const navigate = useNavigate();

  // Declarando constantes para armazenar e salvar agendamentos e agendamentos filtrados
  const [agendamentos, setAgendamentos] = useState([]);
  const [agendamentosFiltrados, setAgendamentosFiltrados] = useState([]);

  // Declarando constante para armazenar os valores dos filtros
  const [filtros, setFiltros] = useState({
    id: "",
    data: "",
    transportadora: "",
    motorista: "",
    placa: "",
    tipoAgendamento: "",
    status: ""
  });

  // Declarando constantes para "espera da página" e mensagens de erro
  const [carregando, setCarregando] = useState(true);
  const [mensagemErro, setMensagemErro] = useState("");

  // Carregando os agendamentos cadastrados (sem filtros)
  useEffect(() => {
    async function carregarAgendamentos(){
      try{
        const resposta = await fetch("http://localhost:8080/agendamentos");

        if(!resposta.ok){
          throw new Error("Não foi possível carregar os agendamentos!");
        }

        const dados = await resposta.json();

        setAgendamentos(dados);
        setAgendamentosFiltrados(dados);
      }
      catch(erro){
        setMensagemErro("Não foi possível carregar os agendamentos!")
      }
      finally{
        setCarregando(false);
      }
    }
    carregarAgendamentos();
  }, []);

  // Atualiza constante dos filtros com base no filtro correspondente
  function atualizarFiltro(event){
    const {name, value} = event.target;

    setFiltros((filtrosAtuais) => ({
      ...filtrosAtuais, [name]: value,
    }));
  }

  // Aplica todos os filtros quando o botão "Filtrar" é clicado
  function filtrarAgendamentos(event){
    event.preventDefault();

    const resultados = agendamentos.filter((agendamento) =>{
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
      const correspondeStatus = String(agendamento.status ?? "")
          .toLowerCase()
          .includes(filtros.status.trim().toLowerCase());
      const correspondeTipo = filtros.tipoAgendamento === "" ||
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

  // Limpa os campos e volta a exibir todos os agendamentos
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

  // Atualizando a tabela de agendamentos após cadastro
  async function atualizarAgendamentos(){

  const resposta = await fetch("http://localhost:8080/agendamentos");

  if (!resposta.ok) {
    throw new Error(
      "Não foi possível atualizar a lista de agendamentos."
    );
  }

  const dados = await resposta.json();

  setAgendamentos(dados);
  setAgendamentosFiltrados(dados);
  }

  return (
    <main className="agendamentos-container">
      <Navbar/>
      {/* Cabeçalho da página de agendamento */}
      <header className="agendamentos-cabecalho">
        <h1>Agendamentos</h1>
        <p>
          Consulte os agendamentos cadastrados e utilize os filtros
          para encontrar os registros desejados.
        </p>

        <button type="button" className="botao-novo-agendamento" onClick={() => 
          navigate("/cadastrar-agendamento")}>+ Novo agendamento
        </button>
        
      </header>

    {/* Container Filtros */}
      <section className="agendamentos-filtros">
        <h2>Pesquisar agendamentos</h2>

        <form onSubmit={filtrarAgendamentos}>
          <div className="agendamentos-filtros-grid">
            <div className="agendamentos-campo">
              <label htmlFor="filtro-id">ID</label>
              <input
                id="filtro-id"
                name="id"
                type="text"
                inputMode="numeric"
                placeholder="ID do agendamento"
                value={filtros.id}
                onChange={atualizarFiltro}
              />
            </div>

            <div className="agendamentos-campo">
              <label htmlFor="filtro-data">Data</label>
              <input
                id="filtro-data"
                name="data"
                type="date"
                value={filtros.data}
                onChange={atualizarFiltro}
              />
            </div>

            <div className="agendamentos-campo">
              <label htmlFor="filtro-transportadora">
                Transportadora
              </label>
              <input
                id="filtro-transportadora"
                name="transportadora"
                type="text"
                placeholder="Nome da transportadora"
                value={filtros.transportadora}
                onChange={atualizarFiltro}
              />
            </div>

            <div className="agendamentos-campo">
              <label htmlFor="filtro-motorista">Motorista</label>
              <input
                id="filtro-motorista"
                name="motorista"
                type="text"
                placeholder="Nome do motorista"
                value={filtros.motorista}
                onChange={atualizarFiltro}
              />
            </div>

            <div className="agendamentos-campo">
              <label htmlFor="filtro-placa">Placa</label>
              <input
                id="filtro-placa"
                name="placa"
                type="text"
                placeholder="Placa do veículo"
                value={filtros.placa}
                onChange={atualizarFiltro}
              />
            </div>

            <div className="agendamentos-campo">
              <label htmlFor="filtro-tipo-agendamento">
                Tipo do agendamento
              </label>

              <select
                id="filtro-tipo-agendamento"
                name="tipoAgendamento"
                value={filtros.tipoAgendamento}
                onChange={atualizarFiltro}
              >
                <option value="">Todos</option>
                <option value="expedicao">Expedição</option>
                <option value="recebimento">Recebimento</option>
              </select>
            </div>

            <div className="agendamentos-campo">
              <label htmlFor="filtro-status">Status</label>
              <input
                id="filtro-status"
                name="status"
                type="text"
                placeholder="Ex.: pendente"
                value={filtros.status}
                onChange={atualizarFiltro}
              />
            </div>
          </div>

          <div className="agendamentos-acoes-filtro">
            <button type="submit" className="botao-filtrar">
              Filtrar
            </button>

            <button
              type="button"
              className="botao-limpar"
              onClick={limparFiltros}
            >
              Limpar filtros
            </button>
          </div>
        </form>
      </section>

    {/* Container Agendamentos */}
      <section className="agendamentos-tabela-container">
        <div className="agendamentos-tabela-cabecalho">
          <h2>Lista de agendamentos</h2>

          <span className="agendamentos-contagem">
            {agendamentosFiltrados.length} registro(s)
          </span>
        </div>

        {carregando ? (
          <p className="agendamentos-mensagem">
            Carregando agendamentos...
          </p>
        ) : mensagemErro ? (
          <p className="agendamentos-erro" role="alert">
            {mensagemErro}
          </p>
        ) : agendamentosFiltrados.length === 0 ? (
          <p className="agendamentos-mensagem">
            Nenhum agendamento encontrado com os filtros informados.
          </p>
        ) : (
          <div className="agendamentos-tabela-scroll">
            <table className="agendamentos-tabela">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Data</th>
                  <th>Transportadora</th>
                  <th>Motorista</th>
                  <th>Placa</th>
                  <th>Tipo Agendamento</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {agendamentosFiltrados.map((agendamento) => (
                  <tr key={agendamento.id} className="agendamento-clicavel" onClick={() => 
                  navigate(`/editar-agendamento/${agendamento.id}`)}>

                    <td>{agendamento.id}</td>
                    <td>{agendamento.data || "—"}</td>
                    <td>{agendamento.transportadora?.nome || "—"}</td>
                    <td>{agendamento.motorista?.nome || "—"}</td>
                    <td>{agendamento.placa || "—"}</td>
                    <td>{agendamento.coleta === true ? "Expedição" : agendamento.coleta === false ? "Recebimento" : "-"}</td>
                    <td>{String(agendamento.status ?? "—").replaceAll("_"," ")}</td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

export default Agendamentos;