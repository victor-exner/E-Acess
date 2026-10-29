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

import com.example.eacess.model.Usuario;
import com.example.eacess.service.UsuarioService;

@RestController 
@RequestMapping("/usuarios")
@CrossOrigin(origins = "http://localhost:5173")
public class UsuarioController {
    @Autowired 
    private UsuarioService usuarioService;

    // Puxando somente dados publicos da classe usuário (nao puxa senha)
    private Map<String, Object> dadosPublicos(Usuario usuario){
        return Map.of(
            "id", usuario.getId(),
            "login", usuario.getLogin(),
            "setor", usuario.getSetor()
        );
    }

    // 1. Listar todos usuários (GET: http://localhost:8080/usuarios)
    @GetMapping
    public List<Map<String, Object>> listarTodos(){
        return usuarioService.listarTodos()
        .stream().map(this::dadosPublicos).toList();
    }

    // 2. Buscar usuário por ID (GET: http://localhost:8080/usuarios/1)
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> buscarPorId(@PathVariable  int id){
        Optional<Usuario> usuario = usuarioService.buscarPorId(id);

        if (usuario.isPresent()) {
            return ResponseEntity.ok(dadosPublicos(usuario.get()));
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

    // 4. Cadastrando usuário
    @PostMapping
    public ResponseEntity<?> cadastrar(@RequestBody Usuario usuario) {
        Usuario novoUsuario = usuarioService.salvar(usuario);

        return ResponseEntity.status(HttpStatus.CREATED)
            .body(dadosPublicos(novoUsuario));
    }

    // 5. Autenticando usuário
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Usuario dados){
        if(dados.getLogin() == null
        || dados.getSenha() == null
        || dados.getLogin().isBlank()
        || dados.getSenha().isBlank()){
            
            return ResponseEntity.badRequest().body(Map.of("mensagem",
                "Informe o login e a senha!"));
        }

        Optional<Usuario> usuario = usuarioService.autenticar(
            dados.getLogin().trim(), dados.getSenha());

        if(usuario.isPresent()){
            return ResponseEntity.ok(dadosPublicos(usuario.get()));
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
            .body(Map.of("mensagem", "Login ou Senha inválidas!"));
    }
}
