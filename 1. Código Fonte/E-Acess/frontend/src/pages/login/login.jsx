import "./login.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/navbar/navbar";

function Login() {
    const [login, setLogin] = useState("");
    const [senha, setSenha] = useState("");
    const [mensagemErro, setMensagemErro] = useState("");
    const [carregando, setCarregando] = useState(false);

    const navigate = useNavigate();

    async function acessar(event) {
        event.preventDefault();
        setMensagemErro("");

        if (!login.trim() || !senha) {
            setMensagemErro("Preencha os campos de login e senha!");
            return;
        }

        setCarregando(true);

        try {
            const resposta = await fetch(
                "http://localhost:8080/usuarios/login",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        login: login.trim(),
                        senha: senha,
                    }),
                }
            );

            const dados = await resposta.json();

            if (!resposta.ok) {
                setMensagemErro(dados.mensagem || "Não foi possível entrar!");
                return;
            }

            sessionStorage.setItem("usuarioLogado", JSON.stringify(dados));
            navigate("/agendamentos", { replace: true });
        } catch (erro) {
            setMensagemErro("Não foi possível conectar ao servidor!");
        } finally {
            setCarregando(false);
        }
    }

    return (
        <div className="login-wrapper d-flex flex-column min-vh-100">
            <Navbar />

            <main className="container my-auto py-4">
                <div className="row justify-content-center">
                    <div className="col-11 col-sm-8 col-md-6 col-lg-4">
                        <div className="login-card p-4">
                            <h1 className="login-title h3 mb-4 fw-bold">Login</h1>

                            <form onSubmit={acessar}>
                                <div className="mb-3">
                                    <label htmlFor="login" className="form-label fw-semibold">
                                        Usuário
                                    </label>
                                    <input
                                        type="text"
                                        id="login"
                                        name="login"
                                        className="form-control login-input"
                                        placeholder="Digite seu Usuário"
                                        value={login}
                                        onChange={(event) => setLogin(event.target.value)}
                                        required
                                        disabled={carregando}
                                    />
                                </div>

                                <div className="mb-4">
                                    <label htmlFor="senha" className="form-label fw-semibold">
                                        Senha
                                    </label>
                                    <input
                                        type="password"
                                        id="senha"
                                        name="senha"
                                        className="form-control login-input"
                                        placeholder="Digite sua Senha"
                                        value={senha}
                                        onChange={(event) => setSenha(event.target.value)}
                                        required
                                        disabled={carregando}
                                    />
                                </div>

                                <div className="row">
                                    <div className="col-12 text-center">
                                        <button
                                            type="submit"
                                            className="btn login-btn px-4 fw-bold"
                                            disabled={carregando}
                                        >
                                            {carregando ? "Entrando..." : "Entrar"}
                                        </button>
                                    </div>
                                </div>
                            </form>

                            {mensagemErro && (
                                <div className="alert alert-danger mt-3 mb-0 py-2 text-center" role="alert">
                                    {mensagemErro}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Login;