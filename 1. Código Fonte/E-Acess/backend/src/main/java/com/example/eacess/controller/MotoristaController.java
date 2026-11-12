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
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.eacess.model.Motorista;
import com.example.eacess.service.MotoristaService;

@RestController
@RequestMapping("/motoristas")
@CrossOrigin(origins = "http://localhost:5173")
public class MotoristaController {

    @Autowired
    private MotoristaService motoristaService;

    // 1. Listar todos ou pesquisar (GET: /motoristas ou /motoristas?termo=jose)
    @GetMapping
    public List<Motorista> listarOuPesquisar(@RequestParam(required = false) String termo) {
        if (termo != null && !termo.isBlank()) {
            return motoristaService.pesquisar(termo);
        }
        return motoristaService.listarTodos();
    }

    // 2. Buscar por ID (GET: /motoristas/1)
    @GetMapping("/{id}")
    public ResponseEntity<?> buscarPorId(@PathVariable int id) {
        Optional<Motorista> motorista = motoristaService.buscarPorId(id);
        if (motorista.isPresent()) {
            return ResponseEntity.ok(motorista.get());
        }
        return ResponseEntity.notFound().build();
    }

    // 3. Cadastrar motorista (POST: /motoristas)
    @PostMapping
    public ResponseEntity<?> cadastrar(@RequestBody Motorista motorista) {
        try {
            Motorista novo = motoristaService.cadastrar(motorista);
            return ResponseEntity.status(HttpStatus.CREATED).body(novo);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("mensagem", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("mensagem", "Erro interno ao cadastrar motorista."));
        }
    }

    // 4. Alterar motorista (PUT: /motoristas/1)
    @PutMapping("/{id}")
    public ResponseEntity<?> atualizar(@PathVariable int id, @RequestBody Motorista motorista) {
        try {
            Motorista atualizado = motoristaService.atualizar(id, motorista);
            return ResponseEntity.ok(atualizado);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("mensagem", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("mensagem", "Erro interno ao atualizar motorista."));
        }
    }

    // 5. Excluir motorista (DELETE: /motoristas/1)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> excluir(@PathVariable int id) {
        try {
            motoristaService.excluir(id);
            return ResponseEntity.ok(Map.of("mensagem", "Motorista excluído com sucesso!"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("mensagem", e.getMessage()));
        } catch (IllegalStateException e) {
            // RN04: Vinculado a agendamentos
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("mensagem", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("mensagem", "Erro interno ao excluir motorista."));
        }
    }
}