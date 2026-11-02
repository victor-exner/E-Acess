package com.example.eacess.exception;

import java.util.Map;

/**
 * FA01 - Dados inválidos. Carrega a mensagem de erro de cada campo.
 */
public class ValidacaoFreteException extends RuntimeException {
    private final Map<String, String> erros;

    public ValidacaoFreteException(Map<String, String> erros) {
        super(String.join(" ", erros.values()));
        this.erros = erros;
    }

    public Map<String, String> getErros() {
        return erros;
    }
}
