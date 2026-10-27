import {Navigate, Route, Routes, useLocation} from "react-router-dom";

import Login from "./pages/Login/Login";
import Agendamentos from "./pages/agendamentos/agendamentos";

function App() {
  const location = useLocation();
  const usuarioLogado = sessionStorage.getItem("usuarioLogado");

  return (
    <Routes>

      {/*1. Redireciona para o login */}
      <Route path="/" element={<Navigate to="/login" replace/>}/>

      {/*2. Exibe o formulário de login */}
      <Route path="/login" element={<Login/>} />

      {/*3. Exibe a página de agendamentos */}
      <Route path="/agendamentos" element={
        usuarioLogado ? <Agendamentos/> : <Navigate to ="/login" replace/>}/>

      {/*4. Qualquer rota não configurada redireciona para o login */}
      <Route path="*" element={<Navigate to="/login" replace />}/>

    </Routes>
  );
}

export default App;