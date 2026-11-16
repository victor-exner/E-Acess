package com.example.eacess.model;

import jakarta.persistence.*;

@Entity 
@Table(name = "motoristas")
public class Motorista {
    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id; // <-- Mudar de int para Integer

    @Column(nullable = false, length = 64)
    private String nome;

    @Column(nullable = false, unique = true, length = 20)
    private String documento;

    public Motorista() {}

    public Motorista(Integer id, String nome, String documento) {
        this.id = id;
        this.nome = nome;
        this.documento = documento;
    }

    // Getters e Setters
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getDocumento() {
        return documento;
    }

    public void setDocumento(String documento) {
        this.documento = documento;
    }
}