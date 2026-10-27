package com.example.eacess.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity 
@Table(name = "agendamentos")
public class Agendamento{
    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(nullable = false)
    private LocalDate data;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "transportadora_id", nullable = false)
    private Transportadora transportadora;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "motorista_id", nullable = false)
    private Motorista motorista;

    @Column(nullable = false, length = 10)
    private String placa;

    @Column(columnDefinition = "TEXT")
    private String descricao;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.PENDENTE;


    // Getters e Setters
    public int getId(){
        return id;
    }

    public void setId(int id){
        this.id = id;
    }

    public LocalDate getData(){
        return data;
    }

    public void setData(LocalDate data){
        this.data = data;
    }

    public Transportadora getTransportadora(){
        return transportadora;
    }

    public void setTransportadora(Transportadora transportadora){
        this.transportadora = transportadora;
    }

    public Motorista getMotorista(){
        return motorista;
    }

    public void setMotorista(Motorista motorista){
        this.motorista = motorista;
    }

    public String getPlaca(){
        return placa;
    }

    public void setPlaca(String placa){
        this.placa = placa;
    }

    public String getDescricao(){
        return descricao;
    }

    public void setDescricao(String descricao){
        this.descricao = descricao;
    }

    public Status getStatus(){
        return status;
    }

    public void setStatus(Status status){
        this.status = status;
    }
}
