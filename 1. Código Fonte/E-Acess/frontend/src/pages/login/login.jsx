import "./login.css";
import {useState} from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/navbar/navbar";

function Login(){
    const [login, setLogin] = useState("");
    const [senha, setSenha] = useState("");
    const [mensagemErro, setMensagemErro] = useState("");
    const [carregando, setCarregando] = useState(false);

    const navigate = useNavigate();

    async function acessar(event){
        event.preventDefault();

        setMensagemErro("");

        if(!login.trim() || !senha){
            setMensagemErro("Preencha os campos de login e senha!");
            return;
        }

        setCarregando(true);

        try{
            const resposta = await fetch(
                "http://localhost:8080/usuarios/login",
                {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({
                        login: login.trim(),
                        senha: senha,
                    }),
                }
            );

            const dados = await resposta.json();

            if(!resposta.ok){
                setMensagemErro(dados.mensagem || "Não foi possível entrar!");
                return;
            }

            sessionStorage.setItem("usuarioLogado", JSON.stringify(dados));

            navigate("/agendamentos", {replace: true});
        } 
        catch(erro){
            setMensagemErro("Não foi possível conectar ao servidor!");
        }
        finally{
            setCarregando(false);
        }
    }

    return(
    <>
        <main className="login-container">
            <Navbar/>
            <div className="login-card">
                <h1 className="login-title">Login</h1>

                <form onSubmit={acessar} className="login-form">
                    <input type="text" id="login" name="login" placeholder="Digite seu Usuário"
                    value={login} onChange={(event) => setLogin(event.target.value)} 
                    required disabled={carregando}/>

                    <input type="password" id="senha" name="senha" placeholder="Digite sua Senha"
                    value={senha} onChange={(event) => setSenha(event.target.value)} 
                    required disabled={carregando}/>
                
                    <button type="submit" className="login-btn" disabled={carregando}>
                        {carregando ? "Entrando..." : "Entrar"}
                    </button>
                </form>

                {mensagemErro && (
                    <p className="login-msg" role="alert">{mensagemErro}</p>
                )}
            </div>
        </main>
    </>
    )
}

export default Login;