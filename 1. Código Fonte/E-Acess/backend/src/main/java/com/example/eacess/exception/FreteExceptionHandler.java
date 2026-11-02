package com.example.eacess.exception;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * Converte as exceções do UC05 em respostas JSON com "mensagem".
 */
@RestControllerAdvice
public class FreteExceptionHandler {

    // FA01 - 400 Bad Request com os erros por campo
    @ExceptionHandler(ValidacaoFreteException.class)
    public ResponseEntity<Map<String, Object>> tratarValidacao(ValidacaoFreteException e) {
        return ResponseEntity.badRequest().body(Map.of(
            "mensagem", e.getMessage(),
            "erros", e.getErros()
        ));
    }

    // FA05 - 422 Unprocessable Entity
    @ExceptionHandler(TarifaNaoConfiguradaException.class)
    public ResponseEntity<Map<String, Object>> tratarTarifa(TarifaNaoConfiguradaException e) {
        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_CONTENT)
            .body(Map.of("mensagem", e.getMessage()));
    }
}
