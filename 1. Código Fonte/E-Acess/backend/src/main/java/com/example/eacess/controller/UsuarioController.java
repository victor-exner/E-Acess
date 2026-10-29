package com.example.eacess.controller;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.eacess.dto.LoginRequest;
import com.example.eacess.dto.LoginResponse;
import com.example.eacess.model.Usuario;
import com.example.eacess.service.UsuarioService;

@RestController 
@RequestMapping("/usuarios")
@CrossOrigin(origins = "http://localhost:5173")
public class UsuarioController {
    @Autowired 
    private UsuarioService usuarioService;

    // 1. Listar todos usuários (GET: http://localhost:8080/usuarios)
    @GetMapping
    public List<Usuario> listarTodos(){
        return usuarioService.listarTodos();
    }

    // 2. Buscar usuário por ID (GET: http://localhost:8080/usuarios/1)
    @GetMapping("/{id}")
    public ResponseEntity<Usuario> buscarPorId(@PathVariable  int id){
        Optional<Usuario> usuario = usuarioService.buscarPorId(id);

        if (usuario.isPresent()) {
            return ResponseEntity.ok(usuario.get());
        }
        return ResponseEntity.notFound().build();
    }

    // 3. Excluir usuário por ID (DELETE: http://localhost:8080/usuarios/1)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable int id){
        Optional<Usuario> usuario = usuarioService.buscarPorId(id);

        if (usuario.isPresent()) {
            usuarioService.excluir(id);

            // Retorna 204 No Content indicando que foi deletado com sucesso
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    // 4. Autenticando usuário
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest dados){
        if(dados.getLogin() == null
        || dados.getSenha() == null
        || dados.getLogin() == null
        || dados.getSenha().isEmpty()){
            
            return ResponseEntity.badRequest().body(Map.of("mensagem",
                "Informe o login e a senha!"));
        }

        Optional<Usuario> usuario = usuarioService.autenticar(
            dados.getLogin().trim(), dados.getSenha());

        if(usuario.isPresent()){
            Usuario usuarioAutenticado = usuario.get();

            LoginResponse resposta = new LoginResponse(
                usuarioAutenticado.getId(),
                usuarioAutenticado.getLogin(),
                usuarioAutenticado.getSetor()
            );

        return ResponseEntity.ok(resposta);
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("mensagem", "Login ou Senha inválidas!"));
    }
}
