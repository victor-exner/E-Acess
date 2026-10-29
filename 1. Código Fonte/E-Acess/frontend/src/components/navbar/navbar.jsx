import {useNavigate } from "react-router-dom";
import "./navbar.css";

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
        <h1>logo aqui</h1>
      </div>

      <div className="menu">

        {usuarioLogado ?(
          <>
          <button className="menu-links" onClick={()=> navigate("/agendamentos")}>Home</button>
          <button className="menu-links" onClick={sair}>Sair</button>
          </>
        ):(
          <>
          <h1>Bem vindo</h1>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;