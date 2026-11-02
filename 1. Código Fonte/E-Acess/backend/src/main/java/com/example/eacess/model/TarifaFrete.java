package com.example.eacess.model;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * UC05 - Simular Frete [RN04]
 * Tabela de tarifas parametrizada pela área de Logística.
 * Os valores ficam no banco e podem ser alterados sem mudar o código.
 */
@Entity
@Table(name = "tarifas_frete")
public class TarifaFrete {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    // Valor cobrado por quilo taxável (R$/kg)
    @Column(nullable = false, precision = 10, scale = 4)
    private BigDecimal tarifaPorKg;

    // Valor cobrado por quilômetro rodado (R$/km)
    @Column(nullable = false, precision = 10, scale = 4)
    private BigDecimal tarifaPorKm;

    // Fator de cubagem (kg por m³) usado para converter volume em peso
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal fatorCubagem;

    // Valor mínimo cobrado por frete (R$)
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal valorMinimo;

    // Getters e Setters
    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public BigDecimal getTarifaPorKg() {
        return tarifaPorKg;
    }

    public void setTarifaPorKg(BigDecimal tarifaPorKg) {
        this.tarifaPorKg = tarifaPorKg;
    }

    public BigDecimal getTarifaPorKm() {
        return tarifaPorKm;
    }

    public void setTarifaPorKm(BigDecimal tarifaPorKm) {
        this.tarifaPorKm = tarifaPorKm;
    }

    public BigDecimal getFatorCubagem() {
        return fatorCubagem;
    }

    public void setFatorCubagem(BigDecimal fatorCubagem) {
        this.fatorCubagem = fatorCubagem;
    }

    public BigDecimal getValorMinimo() {
        return valorMinimo;
    }

    public void setValorMinimo(BigDecimal valorMinimo) {
        this.valorMinimo = valorMinimo;
    }
}
