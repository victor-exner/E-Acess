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

import com.example.eacess.model.Transportadora;
import com.example.eacess.service.TransportadoraService;

@RestController
@RequestMapping("/transportadoras")
@CrossOrigin(origins = "http://localhost:5173")
public class TransportadoraController {

    @Autowired
    private TransportadoraService transportadoraService;

    // 1. Listar todas ou pesquisar (GET: /transportadoras ou /transportadoras?termo=alfa)
    @GetMapping
    public List<Transportadora> listarOuPesquisar(@RequestParam(required = false) String termo) {
        if (termo != null && !termo.isBlank()) {
            return transportadoraService.pesquisar(termo);
        }
        return transportadoraService.listarTodos();
    }

    // 2. Buscar por ID (GET: /transportadoras/1)
    @GetMapping("/{id}")
    public ResponseEntity<?> buscarPorId(@PathVariable int id) {
        Optional<Transportadora> transportadora = transportadoraService.buscarPorId(id);
        if (transportadora.isPresent()) {
            return ResponseEntity.ok(transportadora.get());
        }
        return ResponseEntity.notFound().build();
    }

    // 3. Cadastrar transportadora (POST: /transportadoras)
    @PostMapping
    public ResponseEntity<?> cadastrar(@RequestBody Transportadora transportadora) {
        try {
            Transportadora nova = transportadoraService.cadastrar(transportadora);
            return ResponseEntity.status(HttpStatus.CREATED).body(nova);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("mensagem", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("mensagem", "Erro interno ao cadastrar transportadora."));
        }
    }

    // 4. Alterar transportadora (PUT: /transportadoras/1)
    @PutMapping("/{id}")
    public ResponseEntity<?> atualizar(@PathVariable int id, @RequestBody Transportadora transportadora) {
        try {
            Transportadora atualizada = transportadoraService.atualizar(id, transportadora);
            return ResponseEntity.ok(atualizada);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("mensagem", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("mensagem", "Erro interno ao atualizar transportadora."));
        }
    }

    // 5. Excluir transportadora (DELETE: /transportadoras/1)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> excluir(@PathVariable int id) {
        try {
            transportadoraService.excluir(id);
            return ResponseEntity.ok(Map.of("mensagem", "Transportadora excluída com sucesso!"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("mensagem", e.getMessage()));
        } catch (IllegalStateException e) {
            // RN03: Vinculada a veículos (agendamentos)
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("mensagem", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("mensagem", "Erro interno ao excluir transportadora."));
        }
    }
}
