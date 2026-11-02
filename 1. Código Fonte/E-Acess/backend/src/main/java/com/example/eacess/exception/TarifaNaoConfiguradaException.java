package com.example.eacess.exception;

/**
 * FA05 - Tarifas não parametrizadas.
 */
public class TarifaNaoConfiguradaException extends RuntimeException {
    public TarifaNaoConfiguradaException() {
        super("Não foi possível calcular o frete: tabela de tarifas não configurada");
    }
}
