package com.example.eacess.model;

import java.time.LocalDate;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

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
    private String observacao;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.PENDENTE;

    @Column(nullable = false)
    private boolean coleta;

    // UC05 - Simular Frete [RN05]: no máximo um frete por agendamento.
    // orphanRemoval apaga o frete antigo quando ele é substituído.
    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JoinColumn(name = "frete_id", unique = true)
    private Frete frete;

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

    public String getObservacao(){
        return observacao;
    }

    public void setObservacao(String observacao){
        this.observacao = observacao;
    }

    public Status getStatus(){
        return status;
    }

    public void setStatus(Status status){
        this.status = status;
    }

    public boolean isColeta() {
        return coleta;
    }

    public void setColeta(boolean coleta) {
        this.coleta = coleta;
    }

    public Frete getFrete() {
        return frete;
    }

    public void setFrete(Frete frete) {
        this.frete = frete;
    }
}
