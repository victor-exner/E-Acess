import { useNavigate } from "react-router-dom";
import "./navbar.css";
import logo from "../../assets/logo.png";

function Navbar() {
  const navigate = useNavigate();

  const usuarioSalvo = sessionStorage.getItem("usuarioLogado");
  const usuarioLogado = usuarioSalvo ? JSON.parse(usuarioSalvo) : null;

  function sair() {
    sessionStorage.removeItem("usuarioLogado");
    navigate("/login");
  }

  return (
    <header className="container pt-3">
      <nav className="navbar navbar-custom px-4 py-2">
        <div className="container-fluid d-flex justify-content-between align-items-center">
          <a
            className="navbar-brand d-flex align-items-center m-0"
            href="#/"
            onClick={(e) => {
              e.preventDefault();
              if (usuarioLogado) navigate("/agendamentos");
            }}
          >
            <img src={logo} alt="E-Acess" className="logo-img" />
          </a>

          <div className="d-flex align-items-center gap-2">
            {usuarioLogado ? (
              <>
                <button
                  className="btn navbar-btn"
                  onClick={() => navigate("/agendamentos")}
                >
                  Home
                </button>
                <button className="btn navbar-btn" onClick={sair}>
                  Sair
                </button>
              </>
            ) : (
              <span className="span-navbar mb-0 fw-semibold">
                Bem vindo(a)!
              </span>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;