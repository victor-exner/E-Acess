package com.example.eacess.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.example.eacess.dto.SimulacaoFreteRequest;
import com.example.eacess.dto.SimulacaoFreteResponse;
import com.example.eacess.model.Agendamento;
import com.example.eacess.model.TarifaFrete;
import com.example.eacess.service.FreteService;

/**
 * Endpoints do UC05 - Simular Frete.
 * Erros de validação (FA01) e tarifa não configurada (FA05)
 * são tratados em FreteExceptionHandler.
 */
@RestController
@CrossOrigin(origins = "http://localhost:5173")
public class FreteController {

    @Autowired
    private FreteService freteService;

    // 1. Simular frete sem gravar nada [RN07]
    //    (POST: http://localhost:8080/fretes/simular)
    @PostMapping("/fretes/simular")
    public SimulacaoFreteResponse simular(@RequestBody SimulacaoFreteRequest dados) {
        return freteService.simular(dados);
    }

    // 2. Vincular (ou substituir [RN05]) o frete de um agendamento existente
    //    (PUT: http://localhost:8080/agendamentos/1/frete)
    @PutMapping("/agendamentos/{id}/frete")
    public ResponseEntity<Agendamento> vincular(@PathVariable int id,
                                                @RequestBody SimulacaoFreteRequest dados) {
        return freteService.vincularAoAgendamento(id, dados)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    // 3. Consultar a tabela de tarifas vigente
    //    (GET: http://localhost:8080/fretes/tarifa)
    @GetMapping("/fretes/tarifa")
    public ResponseEntity<TarifaFrete> obterTarifa() {
        return freteService.obterTarifaVigente()
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    // 4. Parametrizar a tabela de tarifas (área de Logística)
    //    (PUT: http://localhost:8080/fretes/tarifa)
    @PutMapping("/fretes/tarifa")
    public TarifaFrete salvarTarifa(@RequestBody TarifaFrete tarifa) {
        return freteService.salvarTarifa(tarifa);
    }
}
