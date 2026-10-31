import {useNavigate } from "react-router-dom";
import "./navbar.css";
import logo from "../../assets/logo.png";

function Navbar() {

  const navigate = useNavigate();

  const usuarioSalvo =
    sessionStorage.getItem("usuarioLogado");

  const usuarioLogado = usuarioSalvo
    ? JSON.parse(usuarioSalvo)
    : null;

  function sair() {
    sessionStorage.removeItem("usuarioLogado");
    navigate("/login");
  }

  return (
    <nav className="navbar">
      <div className="logo">
        <img src={logo} alt="" className="logo-img"/>
      </div>

      <div className="menu">

        {usuarioLogado ?(
          <>
          <div className="navbar-btn-container">
            <button className="navbar-btn" onClick={()=> navigate("/agendamentos")}>Home</button>
            <button className="navbar-btn" onClick={sair}>Sair</button>
          </div>
          </>
        ):(
          <>
          <h1 className="span-navbar">{"Bem vindo(a)!"}</h1>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;