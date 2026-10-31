import {Navigate, Route, Routes} from "react-router-dom";

import Login from "./pages/login/login";
import Agendamentos from "./pages/agendamentos/agendamentos";
import CadastrarAgendamento from "./pages/cadastrarAgendamento/cadastrarAgendamento";
import EditarAgendamento from "./pages/editarAgendamento/editarAgendamento";

// Verificando se existe usuário autenticado na sessão
function verificarLogado(){
  try{
    const usuario = JSON.parse(
      sessionStorage.getItem("usuarioLogado")
    );

    return Boolean(usuario && usuario.id && usuario.login);
  }
  catch{
    return false;
  }
}

// Protegendo páginas que exigem login
function RotaProtegida({children}){
  if(!verificarLogado()){
    return <Navigate to="/login" replace/>
  }
  return children;
}

// Função principal com as rotas
function App() {
  return (
    <Routes>

      {/*1. Redireciona para o login */}
      <Route path="/" element={<Navigate to="/login"/>}/>

      {/*2. Exibe o formulário de login */}
      <Route path="/login" element={<Login/>} />

      {/*3. Exibe a página de agendamentos */}
      <Route path="/agendamentos" element={
        <RotaProtegida>
          <Agendamentos/>
        </RotaProtegida>}/>
      
      {/* 4. Rota para direcionar para cadastro de agendamento */}
      <Route path="/cadastrar-agendamento" element={
        <RotaProtegida>
          <CadastrarAgendamento/>
        </RotaProtegida>}/>

      {/* 5. Rota para editar um agendamento */}
      <Route path="/editar-agendamento/:id" element={
        <RotaProtegida>
          <EditarAgendamento/>
        </RotaProtegida>}/>

      {/*6. Qualquer rota não configurada redireciona para o login */}
      <Route path="*" element={<Navigate to="/" replace/>}/>
  
    </Routes>
  );
}

export default App;