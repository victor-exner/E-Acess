package com.example.eacess.repository;

import com.example.eacess.model.Agendamento;
import com.example.eacess.model.Status;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface AgendamentoRepository extends JpaRepository<Agendamento, Integer>{
    List<Agendamento> findByData(LocalDate data);
    List<Agendamento> findByMotorista(String motorista);
    List<Agendamento> findByTransportadora(String transportadora);
    List<Agendamento> findByPlaca(String placa);
    List<Agendamento> findByStatus(Status status);

    // Buscar agendamentos pelo ID da Transportadora
    List<Agendamento> findByTransportadoraId(int transportadora);

    // Buscar agendamentos pelo ID do Motorista
    List<Agendamento> findByMotoristaId(int motorista);
}
