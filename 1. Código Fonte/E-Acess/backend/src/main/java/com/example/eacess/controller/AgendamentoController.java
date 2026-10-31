package com.example.eacess.controller;

import com.example.eacess.model.Agendamento;
import com.example.eacess.model.Status;
import com.example.eacess.service.AgendamentoService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/agendamentos")
@CrossOrigin(origins = "http://localhost:5173")
public class AgendamentoController {
    @Autowired
    private AgendamentoService agendamentoService;

    // 1. Listar todos os agendamentos (GET: http://localhost:8080/agendamentos)
    @GetMapping 
    public List<Agendamento> listarTodos(){
        return agendamentoService.listarTodos();
    }

    // 2. Buscar agendamento por ID (Retorna Optional convertido para ResponseEntity)
    @GetMapping("/{id}")
    public ResponseEntity<Agendamento> buscarPorId(@PathVariable int id){
        Optional<Agendamento> agendamento = agendamentoService.buscarPorId(id);

        if (agendamento.isPresent()){
            return ResponseEntity.ok(agendamento.get());
        }
        return ResponseEntity.notFound().build();
    }

    // 3. Salvar ou atualizar agendamento
    @PostMapping 
    public ResponseEntity<Agendamento> salvar(@RequestBody Agendamento agendamento){
        Agendamento novAgendamento = agendamentoService.salvar(agendamento);
        return ResponseEntity.status(HttpStatus.CREATED).body(novAgendamento);
    }

    // 4. Atualizando agendamento existente
    @PutMapping("/{id}")
    public ResponseEntity<Agendamento> atualizar(
        @PathVariable int id, @RequestBody Agendamento dadosAtualizados){

        Optional<Agendamento> agendamentoExistente = agendamentoService.buscarPorId(id);

        if(agendamentoExistente.isEmpty()){
            return ResponseEntity.notFound().build();
        }

        Agendamento agendamento = agendamentoExistente.get();

        agendamento.setData(dadosAtualizados.getData());
        agendamento.setTransportadora(dadosAtualizados.getTransportadora());
        agendamento.setMotorista(dadosAtualizados.getMotorista());
        agendamento.setPlaca(dadosAtualizados.getPlaca());
        agendamento.setDescricao(dadosAtualizados.getDescricao());
        agendamento.setStatus(dadosAtualizados.getStatus());
        agendamento.setColeta(dadosAtualizados.isColeta());

        Agendamento atualizado = agendamentoService.salvar(agendamento);

        return ResponseEntity.ok(atualizado);
        }

    // 5. Excluir agendamento por ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable int id) {
        Optional<Agendamento> agendamento = agendamentoService.buscarPorId(id);
        
        if (agendamento.isPresent()) {
            agendamentoService.excluir(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    // =====Endpoints de filtros por Lista=====

    // FILTRO DE DATA
    @GetMapping("/data/{data}")
    public ResponseEntity<List<Agendamento>> buscarPorData(@PathVariable LocalDate data){
        List<Agendamento> agendamentos = agendamentoService.buscarPorData(data);
        
        if (agendamentos.isEmpty()){
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(agendamentos);
    }

    // Buscar agendamentos por ID da Transportadora (GET: /agendamentos/transportadora/1)
    @GetMapping("/transportadora/{transportadora}")
    public ResponseEntity<List<Agendamento>> buscarPorTransportadoraId(@PathVariable int transportadora){
        List<Agendamento> agendamentos = agendamentoService.buscarPorTransportadoraId(transportadora);
        
        if (agendamentos.isEmpty()){
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(agendamentos);
    }

    // Buscar agendamentos por ID do Motorista (GET: /agendamentos/motorista/1)
    @GetMapping("/motorista/{motorista}")
    public ResponseEntity<List<Agendamento>> buscarPorMotoristaId(@PathVariable int motorista){
        List<Agendamento> agendamentos = agendamentoService.buscarPorMotoristaId(motorista);
        
        if (agendamentos.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(agendamentos);
    }
    
    // FILTRO DE PLACA
    @GetMapping("/placa/{placa}")
    public ResponseEntity<List<Agendamento>> buscarPorPlaca(@PathVariable String placa){
        List<Agendamento> agendamentos = agendamentoService.buscarPorPlaca(placa);
        
        if (agendamentos.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(agendamentos);
    }

    // FILTRO DE STATUS
    @GetMapping("/status/{status}")
    public ResponseEntity<List<Agendamento>> buscarPorStatus(@PathVariable Status status){
        List<Agendamento> agendamentos = agendamentoService.buscarPorStatus(status);
        
        if (agendamentos.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(agendamentos);
    }
}
