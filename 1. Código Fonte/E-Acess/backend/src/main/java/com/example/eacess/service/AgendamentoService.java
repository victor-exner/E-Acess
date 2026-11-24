package com.example.eacess.service;

import com.example.eacess.model.Agendamento;
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
        // Validações antes de salvar dados do agendamento
        validarPlaca(agendamento.getPlaca());

        // A data só é validada no cadastro; na edição, o controller valida apenas se a data foi alterada
        if(agendamento.getId() == 0){
            validarData(agendamento.getData());
        }

        agendamento.setPlaca(agendamento.getPlaca().trim().toUpperCase());

        // Garante que o valor padrão de "status" seja "pendente"
        if(agendamento.getStatus() == null){
            agendamento.setStatus(Status.PENDENTE);
        }

        // UC05 - Simular Frete: o frete só é vinculado pelo FreteService,
        // que recalcula o valor. Um frete enviado no cadastro é ignorado.
        if(agendamento.getId() == 0){
            agendamento.setFrete(null);
        }

        return agendamentoRepository.save(agendamento);
    }

    // Validação da data: não permite agendar em datas passadas
    public void validarData(LocalDate data){
        if(data == null){
            throw new IllegalArgumentException("A data do agendamento é obrigatória");
        }

        if(data.isBefore(LocalDate.now())){
            throw new IllegalArgumentException("Não é possível agendar em datas passadas");
        }
    }

    // Validação da placa: exatamente 7 caracteres (letras e números)
    public void validarPlaca(String placa){
        if(placa == null || !placa.trim().matches("^[A-Za-z0-9]{7}$")){
            throw new IllegalArgumentException("A placa deve ter exatamente 7 caracteres (letras e números)");
        }
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
