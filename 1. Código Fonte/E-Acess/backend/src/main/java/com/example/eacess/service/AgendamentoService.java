package com.example.eacess.service;

import com.example.eacess.model.Agendamento;
import com.example.eacess.model.Frete;
import com.example.eacess.model.Status;
import com.example.eacess.repository.AgendamentoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class AgendamentoService {
    
    @Autowired 
    private AgendamentoRepository agendamentoRepository;

    @Autowired
    private FreteService freteService;

    // Listar todos agendamentos
    public List<Agendamento> listarTodos(){
        return agendamentoRepository.findAll();
    }

    // Buscar agendamento por ID
    public Optional<Agendamento> buscarPorId(int id){
        return agendamentoRepository.findById(id);
    }

    // Salvar ou atualizar agendamento
    public Agendamento salvar(Agendamento agendamento){
        // Adicionar aqui futuras validações antes de salvar dados do agendamento
        
        // Garante que o valor padrão de "status" seja "pendente"
        if(agendamento.getStatus() == null){
            agendamento.setStatus(Status.PENDENTE);
        }

        // UC05 - frete simulado durante o cadastro (ainda sem id):
        // recalcula o valor no servidor em vez de confiar no valor enviado
        Frete frete = agendamento.getFrete();
        if (frete != null && frete.getId() == 0) {
            agendamento.setFrete(freteService.gerarFrete(freteService.requisicaoDe(frete)));
        }

        return agendamentoRepository.save(agendamento);
    }

    // Excluir agendamento por ID 
    public void excluir(int id){
        agendamentoRepository.deleteById(id);
    }


    // =====Buscar agendamentos através dos filtros=====
    public List<Agendamento> buscarPorData(LocalDate data){
        return agendamentoRepository.findByData(data);
    }

    public List<Agendamento> buscarPorTransportadoraId(int transportadora){
    return agendamentoRepository.findByTransportadoraId(transportadora);
}

    public List<Agendamento> buscarPorMotoristaId(int motorista){
        return agendamentoRepository.findByMotoristaId(motorista);
    }

    public List<Agendamento> buscarPorPlaca(String placa){
        return agendamentoRepository.findByPlaca(placa);
    }

    public List<Agendamento> buscarPorStatus(Status status){
        return agendamentoRepository.findByStatus(status);
    }

}
