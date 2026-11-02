package com.example.eacess.controller;

import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.example.eacess.model.Agendamento;
import com.example.eacess.model.Frete;
import com.example.eacess.model.TarifaFrete;
import com.example.eacess.service.FreteService;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
public class FreteController {

    @Autowired
    private FreteService freteService;

    // 1. Simular frete sem gravar nada (POST: http://localhost:8080/fretes/simular)
    @PostMapping("/fretes/simular")
    public ResponseEntity<Map<String, Object>> simular(@RequestBody Frete dados) {
        return responder(freteService.simular(dados));
    }

    // 2. Vincular (ou substituir) o frete de um agendamento
    //    (PUT: http://localhost:8080/agendamentos/1/frete)
    @PutMapping("/agendamentos/{id}/frete")
    public ResponseEntity<?> vincular(@PathVariable int id, @RequestBody Frete dados) {
        Optional<Agendamento> agendamento = freteService.buscarAgendamento(id);

        if (agendamento.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Map<String, Object> resultado = freteService.vincularAoAgendamento(agendamento.get(), dados);
        if (resultado.containsKey("erros")) {
            return ResponseEntity.badRequest().body(resultado);
        }
        return ResponseEntity.ok(resultado.get("agendamento"));
    }

    // 3. Consultar os parâmetros do frete (GET: http://localhost:8080/fretes/tarifa)
    @GetMapping("/fretes/tarifa")
    public ResponseEntity<TarifaFrete> buscarTarifa() {
        Optional<TarifaFrete> tarifa = freteService.buscarTarifa();

        if (tarifa.isPresent()) {
            return ResponseEntity.ok(tarifa.get());
        }
        return ResponseEntity.notFound().build();
    }

    // 4. Alterar os parâmetros do frete (PUT: http://localhost:8080/fretes/tarifa)
    @PutMapping("/fretes/tarifa")
    public ResponseEntity<?> salvarTarifa(@RequestBody TarifaFrete tarifa) {
        Map<String, Object> resultado = freteService.salvarTarifa(tarifa);

        if (resultado.containsKey("erros")) {
            return ResponseEntity.badRequest().body(resultado);
        }
        return ResponseEntity.ok(resultado.get("tarifa"));
    }

    // Erro de validação ou tarifa não configurada -> 400; sucesso -> 200
    private ResponseEntity<Map<String, Object>> responder(Map<String, Object> resultado) {
        if (resultado.containsKey("erros")) {
            return ResponseEntity.badRequest().body(resultado);
        }
        return ResponseEntity.ok(resultado);
    }
}
