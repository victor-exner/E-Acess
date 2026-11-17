import { useState, useEffect } from "react";
import "./manterTransportadora.css";

const API = "http://localhost:8080";

function ManterTransportadoraModal({ aoFechar, aoSelecionarTransportadora }) {
  const [transportadoras, setTransportadoras] = useState([]);
  const [termoBusca, setTermoBusca] = useState("");
  const [carregando, setCarregando] = useState(false);

  const [modo, setModo] = useState("LISTA"); // "LISTA" ou "FORMULARIO"
  const [transportadoraEmEdicao, setTransportadoraEmEdicao] = useState(null);

  const [nome, setNome] = useState("");

  const [mensagemErro, setMensagemErro] = useState("");
  const [mensagemSucesso, setMensagemSucesso] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    carregarTransportadoras();
  }, []);

  async function carregarTransportadoras(termo = "") {
    setCarregando(true);
    setMensagemErro("");
    try {
      const url = termo.trim()
        ? `${API}/transportadoras?termo=${encodeURIComponent(termo.trim())}`
        : `${API}/transportadoras`;

      const resposta = await fetch(url);
      if (!resposta.ok) throw new Error("Erro ao carregar lista de transportadoras.");

      const dados = await resposta.json();
      setTransportadoras(dados);
    } catch (erro) {
      setMensagemErro(erro.message);
    } finally {
      setCarregando(false);
    }
  }

  function handlePesquisar(e) {
    e.preventDefault();
    carregarTransportadoras(termoBusca);
  }

  function iniciarNova() {
    setTransportadoraEmEdicao(null);
    setNome("");
    setMensagemErro("");
    setMensagemSucesso("");
    setModo("FORMULARIO");
  }

  function iniciarEdicao(transportadora) {
    setTransportadoraEmEdicao(transportadora);
    setNome(transportadora.nome);
    setMensagemErro("");
    setMensagemSucesso("");
    setModo("FORMULARIO");
  }

  async function salvarTransportadora(e) {
    e.preventDefault();
    setMensagemErro("");
    setMensagemSucesso("");

    // RN01
    if (!nome.trim()) {
      setMensagemErro("O nome é obrigatório.");
      return;
    }
    if (nome.trim().length > 64) {
      setMensagemErro("O nome deve ter no máximo 64 caracteres.");
      return;
    }

    setSalvando(true);
    const dados = { nome: nome.trim() };
    const ehEdicao = Boolean(transportadoraEmEdicao);

    try {
      const url = ehEdicao ? `${API}/transportadoras/${transportadoraEmEdicao.id}` : `${API}/transportadoras`;
      const metodo = ehEdicao ? "PUT" : "POST";

      const resposta = await fetch(url, {
        method: metodo,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados),
      });

      const retorno = await resposta.json().catch(() => ({}));

      if (!resposta.ok) {
        throw new Error(retorno.mensagem || "Erro ao salvar transportadora.");
      }

      if (ehEdicao) {
        setMensagemSucesso("Transportadora atualizada com sucesso!");
        setTimeout(() => {
          setModo("LISTA");
          carregarTransportadoras();
        }, 800);
      } else {
        // RN04: Retorna ao agendamento com a nova transportadora selecionada
        setMensagemSucesso("Transportadora cadastrada com sucesso!");
        setTimeout(() => {
          aoSelecionarTransportadora(retorno);
          aoFechar();
        }, 800);
      }
    } catch (erro) {
      setMensagemErro(erro.message);
    } finally {
      setSalvando(false);
    }
  }

  // FA03 - Excluir com validação de vínculo (RN03)
  async function excluirTransportadora(id, nomeTransportadora) {
    const confirmou = window.confirm(`Deseja realmente excluir a transportadora "${nomeTransportadora}"?`);
    if (!confirmou) return;

    setMensagemErro("");
    setMensagemSucesso("");

    try {
      const resposta = await fetch(`${API}/transportadoras/${id}`, {
        method: "DELETE",
      });

      const retorno = await resposta.json().catch(() => ({}));

      if (!resposta.ok) {
        throw new Error(retorno.mensagem || "Não foi possível excluir a transportadora.");
      }

      setMensagemSucesso("Transportadora excluída com sucesso!");
      carregarTransportadoras();
    } catch (erro) {
      setMensagemErro(erro.message);
    }
  }

  return (
    <div className="transportadora-modal-fundo" role="dialog" aria-modal="true">
      <div className="transportadora-modal-card">
        <header className="transportadora-modal-cabecalho">
          <h2>{modo === "LISTA" ? "Gerenciar Transportadoras" : (transportadoraEmEdicao ? "Alterar Transportadora" : "Nova Transportadora")}</h2>
          <button type="button" className="transportadora-modal-fechar" onClick={aoFechar}>&times;</button>
        </header>

        {mensagemErro && <p className="transportadora-msg-erro">{mensagemErro}</p>}
        {mensagemSucesso && <p className="transportadora-msg-sucesso">{mensagemSucesso}</p>}

        {modo === "LISTA" ? (
          <div className="transportadora-conteudo-lista">
            <div className="transportadora-barra-acoes">
              <form onSubmit={handlePesquisar} className="transportadora-pesquisa-form">
                <input
                  type="text"
                  placeholder="Pesquisar por nome..."
                  value={termoBusca}
                  onChange={(e) => setTermoBusca(e.target.value)}
                />
                <button type="submit" className="transportadora-btn">Pesquisar</button>
              </form>
              <button type="button" className="transportadora-btn transportadora-btn-novo" onClick={iniciarNova}>
                + Nova Transportadora
              </button>
            </div>

            {carregando ? (
              <p>A carregar transportadoras...</p>
            ) : transportadoras.length === 0 ? (
              <p className="transportadora-vazio">Nenhuma transportadora encontrada.</p>
            ) : (
              <table className="transportadora-tabela">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nome</th>
                    <th style={{ textAlign: "center" }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {transportadoras.map((t) => (
                    <tr key={t.id}>
                      <td>{t.id}</td>
                      <td>{t.nome}</td>
                      <td className="transportadora-acoes-col">
                        <button
                          type="button"
                          className="transportadora-btn-acao"
                          title="Selecionar para este agendamento"
                          onClick={() => {
                            aoSelecionarTransportadora(t);
                            aoFechar();
                          }}
                        >
                          Selecionar
                        </button>
                        <button
                          type="button"
                          className="transportadora-btn-acao"
                          title="Editar"
                          onClick={() => iniciarEdicao(t)}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="transportadora-btn-acao transportadora-btn-del"
                          title="Excluir"
                          onClick={() => excluirTransportadora(t.id, t.nome)}
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <div className="transportadora-modal-rodape">
              <button type="button" className="transportadora-btn" onClick={aoFechar}>
                Fechar
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={salvarTransportadora} className="transportadora-form">
            <div className="transportadora-campo">
              <label htmlFor="transp-nome">Nome (máx. 64 caracteres) *</label>
              <input
                id="transp-nome"
                type="text"
                maxLength={64}
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex.: Transportes Alfa"
                disabled={salvando}
              />
            </div>

            <div className="transportadora-modal-rodape">
              <button
                type="button"
                className="transportadora-btn"
                onClick={() => setModo("LISTA")}
                disabled={salvando}
              >
                Voltar à Lista
              </button>
              <button
                type="submit"
                className="transportadora-btn transportadora-btn-salvar"
                disabled={salvando}
              >
                {salvando ? "A gravar..." : (transportadoraEmEdicao ? "Atualizar" : "Cadastrar")}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default ManterTransportadoraModal;
