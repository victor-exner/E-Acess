import { useState, useEffect } from "react";
import "./manterMotorista.css";

const API = "http://localhost:8080";

function ManterMotoristaModal({ aoFechar, aoSelecionarMotorista }) {
  const [motoristas, setMotoristas] = useState([]);
  const [termoBusca, setTermoBusca] = useState("");
  const [carregando, setCarregando] = useState(false);

  const [modo, setModo] = useState("LISTA"); // "LISTA" ou "FORMULARIO"
  const [motoristaEmEdicao, setMotoristaEmEdicao] = useState(null);

  const [nome, setNome] = useState("");
  const [documento, setDocumento] = useState("");

  const [mensagemErro, setMensagemErro] = useState("");
  const [mensagemSucesso, setMensagemSucesso] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    carregarMotoristas();
  }, []);

  async function carregarMotoristas(termo = "") {
    setCarregando(true);
    setMensagemErro("");
    try {
      const url = termo.trim()
        ? `${API}/motoristas?termo=${encodeURIComponent(termo.trim())}`
        : `${API}/motoristas`;

      const resposta = await fetch(url);
      if (!resposta.ok) throw new Error("Erro ao carregar lista de motoristas.");

      const dados = await resposta.json();
      setMotoristas(dados);
    } catch (erro) {
      setMensagemErro(erro.message);
    } finally {
      setCarregando(false);
    }
  }

  function handlePesquisar(e) {
    e.preventDefault();
    carregarMotoristas(termoBusca);
  }

  function iniciarNovo() {
    setMotoristaEmEdicao(null);
    setNome("");
    setDocumento("");
    setMensagemErro("");
    setMensagemSucesso("");
    setModo("FORMULARIO");
  }

  function iniciarEdicao(motorista) {
    setMotoristaEmEdicao(motorista);
    setNome(motorista.nome);
    setDocumento(motorista.documento);
    setMensagemErro("");
    setMensagemSucesso("");
    setModo("FORMULARIO");
  }

  async function salvarMotorista(e) {
    e.preventDefault();
    setMensagemErro("");
    setMensagemSucesso("");

    // RN01, RN02, RN03
    if (!nome.trim() || !documento.trim()) {
      setMensagemErro("Nome e documento são obrigatórios.");
      return;
    }
    if (nome.trim().length > 64) {
      setMensagemErro("O nome deve ter no máximo 64 caracteres.");
      return;
    }
    if (!/^\d+$/.test(documento.trim())) {
      setMensagemErro("O documento deve conter apenas números.");
      return;
    }

    setSalvando(true);
    const dados = { nome: nome.trim(), documento: documento.trim() };
    const ehEdicao = Boolean(motoristaEmEdicao);

    try {
      const url = ehEdicao ? `${API}/motoristas/${motoristaEmEdicao.id}` : `${API}/motoristas`;
      const metodo = ehEdicao ? "PUT" : "POST";

      const resposta = await fetch(url, {
        method: metodo,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados),
      });

      const retorno = await resposta.json().catch(() => ({}));

      if (!resposta.ok) {
        throw new Error(retorno.mensagem || "Erro ao salvar motorista.");
      }

      if (ehEdicao) {
        setMensagemSucesso("Motorista atualizado com sucesso!");
        setTimeout(() => {
          setModo("LISTA");
          carregarMotoristas();
        }, 800);
      } else {
        // RN05: Retorna ao agendamento com o novo motorista selecionado
        setMensagemSucesso("Motorista cadastrado com sucesso!");
        setTimeout(() => {
          aoSelecionarMotorista(retorno);
          aoFechar();
        }, 800);
      }
    } catch (erro) {
      setMensagemErro(erro.message);
    } finally {
      setSalvando(false);
    }
  }

  // FA03 - Excluir com validação de vínculo (RN04)
  async function excluirMotorista(id, nomeMotorista) {
    const confirmou = window.confirm(`Deseja realmente excluir o motorista "${nomeMotorista}"?`);
    if (!confirmou) return;

    setMensagemErro("");
    setMensagemSucesso("");

    try {
      const resposta = await fetch(`${API}/motoristas/${id}`, {
        method: "DELETE",
      });

      const retorno = await resposta.json().catch(() => ({}));

      if (!resposta.ok) {
        throw new Error(retorno.mensagem || "Não foi possível excluir o motorista.");
      }

      setMensagemSucesso("Motorista excluído com sucesso!");
      carregarMotoristas();
    } catch (erro) {
      setMensagemErro(erro.message);
    }
  }

  return (
    <div className="motorista-modal-fundo" role="dialog" aria-modal="true">
      <div className="motorista-modal-card">
        <header className="motorista-modal-cabecalho">
          <h2>{modo === "LISTA" ? "Gerenciar Motoristas" : (motoristaEmEdicao ? "Alterar Motorista" : "Novo Motorista")}</h2>
          <button type="button" className="motorista-modal-fechar" onClick={aoFechar}>&times;</button>
        </header>

        {mensagemErro && <p className="motorista-msg-erro">{mensagemErro}</p>}
        {mensagemSucesso && <p className="motorista-msg-sucesso">{mensagemSucesso}</p>}

        {modo === "LISTA" ? (
          <div className="motorista-conteudo-lista">
            <div className="motorista-barra-acoes">
              <form onSubmit={handlePesquisar} className="motorista-pesquisa-form">
                <input
                  type="text"
                  placeholder="Pesquisar por nome ou documento..."
                  value={termoBusca}
                  onChange={(e) => setTermoBusca(e.target.value)}
                />
                <button type="submit" className="motorista-btn">Pesquisar</button>
              </form>
              <button type="button" className="motorista-btn motorista-btn-novo" onClick={iniciarNovo}>
                + Novo Motorista
              </button>
            </div>

            {carregando ? (
              <p>A carregar motoristas...</p>
            ) : motoristas.length === 0 ? (
              <p className="motorista-vazio">Nenhum motorista encontrado.</p>
            ) : (
              <table className="motorista-tabela">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nome</th>
                    <th>Documento</th>
                    <th style={{ textAlign: "center" }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {motoristas.map((m) => (
                    <tr key={m.id}>
                      <td>{m.id}</td>
                      <td>{m.nome}</td>
                      <td>{m.documento}</td>
                      <td className="motorista-acoes-col">
                        <button
                          type="button"
                          className="motorista-btn-acao"
                          title="Selecionar para este agendamento"
                          onClick={() => {
                            aoSelecionarMotorista(m);
                            aoFechar();
                          }}
                        >
                          Selecionar
                        </button>
                        <button
                          type="button"
                          className="motorista-btn-acao"
                          title="Editar"
                          onClick={() => iniciarEdicao(m)}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="motorista-btn-acao motorista-btn-del"
                          title="Excluir"
                          onClick={() => excluirMotorista(m.id, m.nome)}
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <div className="motorista-modal-rodape">
              <button type="button" className="motorista-btn" onClick={aoFechar}>
                Fechar
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={salvarMotorista} className="motorista-form">
            <div className="motorista-campo">
              <label htmlFor="mot-nome">Nome (máx. 64 caracteres) *</label>
              <input
                id="mot-nome"
                type="text"
                maxLength={64}
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex.: José Souza"
                disabled={salvando}
              />
            </div>

            <div className="motorista-campo">
              <label htmlFor="mot-doc">Documento (apenas números) *</label>
              <input
                id="mot-doc"
                type="text"
                required
                value={documento}
                onChange={(e) => setDocumento(e.target.value)}
                placeholder="Ex.: 12345678901"
                disabled={salvando}
              />
            </div>

            <div className="motorista-modal-rodape">
              <button
                type="button"
                className="motorista-btn"
                onClick={() => setModo("LISTA")}
                disabled={salvando}
              >
                Voltar à Lista
              </button>
              <button
                type="submit"
                className="motorista-btn motorista-btn-salvar"
                disabled={salvando}
              >
                {salvando ? "A gravar..." : (motoristaEmEdicao ? "Atualizar" : "Cadastrar")}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default ManterMotoristaModal;