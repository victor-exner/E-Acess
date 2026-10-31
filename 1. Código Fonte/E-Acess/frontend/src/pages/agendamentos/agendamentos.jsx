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
      const correspondeStatus = filtros.status === "" ||
          agendamento.status === filtros.status;
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
    
    <div className="container-principal">
      <header className="agendamentos-cabecalho">
        <h1 className="agendamentos-title">Agendamentos</h1>

        <button type="button" className="btn-novo-agendamento" onClick={() => 
          navigate("/cadastrar-agendamento")}>+ Novo agendamento
        </button>
        
      </header>

      <hr></hr>

    {/* Container Filtros */}
    <section className="filtros-container">
      <form onSubmit={filtrarAgendamentos} className="form-filtros">
        <div className="filtro-card">
          <div className="filtro-campo">
            <label htmlFor="filtro-id">ID</label>
              <input
                id="filtro-id"
                name="id"
                type="text"
                inputMode="numeric"
                placeholder="ID do Agendamento"
                value={filtros.id}
                onChange={atualizarFiltro}/>
          </div>

          <div className="filtro-campo">
            <label htmlFor="filtro-data">Data</label>
              <input
                id="filtro-data"
                name="data"
                type="date"
                value={filtros.data}
                onChange={atualizarFiltro}/>
          </div>

          <div className="filtro-campo">
            <label htmlFor="filtro-transportadora">Transportadora</label>
              <input
                id="filtro-transportadora"
                name="transportadora"
                type="text"
                placeholder="Transportadora"
                value={filtros.transportadora}
                onChange={atualizarFiltro}/>
          </div>

          <div className="filtro-campo">
            <label htmlFor="filtro-motorista">Motorista</label>
              <input
                id="filtro-motorista"
                name="motorista"
                type="text"
                placeholder="Motorista"
                value={filtros.motorista}
                onChange={atualizarFiltro}/>
            </div>

          <div className="filtro-campo">
            <label htmlFor="filtro-placa">Placa</label>
              <input
                id="filtro-placa"
                name="placa"
                type="text"
                placeholder="Placa do Veículo"
                value={filtros.placa}
                onChange={atualizarFiltro}/>
          </div>

          <div className="filtro-campo">
            <label htmlFor="filtro-tipo-agendamento">Tipo</label>
              <select
                id="filtro-tipo-agendamento"
                name="tipoAgendamento"
                value={filtros.tipoAgendamento}
                onChange={atualizarFiltro}>
                <option value="">Todos</option>
                <option value="expedicao">Expedição</option>
                <option value="recebimento">Recebimento</option>
              </select>
          </div>

          <div className="filtro-campo">
            <label htmlFor="filtro-status">Status</label>
              <select 
                name="status" 
                id="filtro-status"
                value={filtros.status}
                onChange={atualizarFiltro}>
                <option value="">Todos</option>
                <option value="ANDAMENTO">Andamento</option>
                <option value="PENDENTE">Pendente</option>
                <option value="CONCLUIDO">Concluído</option>
              </select>
          </div>

          <div className="filtro-btns-container">
            <button type="submit" className="filtro-btns">Filtrar</button>

            <button type="button" className="filtro-btns" onClick={limparFiltros}>
              Limpar
            </button>

          </div>
        </div>
      </form>
    </section>

    {/* Container Agendamentos */}
      <section className="agendamentos-lista">
        <div className="agendamentos-tabela-cabecalho">
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
        <table className="agendamentos-tabela">
          <thead>
            <tr className="labels-container">
              <th className="agendamentos-labels"
              style={{paddingLeft: "10px"}}>ID</th>
              <th className="agendamentos-labels">Data</th>
              <th className="agendamentos-labels">Transportadora</th>
              <th className="agendamentos-labels">Motorista</th>
              <th className="agendamentos-labels">Placa</th>
              <th className="agendamentos-labels">Tipo</th>
              <th className="agendamentos-labels">Status</th>
            </tr>
          </thead>

          <div className="agendamentos-tabela-scroll">
            <tbody>
              {agendamentosFiltrados.map((agendamento) => (
                <tr key={agendamento.id} className="agendamento-linha" onClick={() => 
                navigate(`/editar-agendamento/${agendamento.id}`)}>
                  <td className="agendamentos-items"
                  style={{paddingLeft: "6px"}}>{agendamento.id}</td>
                  <td className="agendamentos-items">{agendamento.data || "—"}</td>
                  <td className="agendamentos-items">{agendamento.transportadora?.nome || "—"}</td>
                  <td className="agendamentos-items">{agendamento.motorista?.nome || "—"}</td>
                  <td className="agendamentos-items">{agendamento.placa || "—"}</td>
                  <td className="agendamentos-items">{agendamento.coleta === true ? "Expedição" : agendamento.coleta === false ? "Recebimento" : "-"}</td>
                  <td className="agendamentos-items">
                  {String(agendamento.status ?? "—").replaceAll("_"," ")}</td>
                </tr>
                ))}
            </tbody>
          </div>
        </table>
        )}
      </section>
    </div>
  </main>
  );
}

export default Agendamentos;