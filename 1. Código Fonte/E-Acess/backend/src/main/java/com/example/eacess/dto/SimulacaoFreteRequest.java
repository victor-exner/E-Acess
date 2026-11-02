package com.example.eacess.dto;

import java.math.BigDecimal;

/**
 * Dados informados pelo usuário para simular o frete (UC05 - passo 3).
 * As medidas da carga são enviadas em três campos separados, em metros.
 * No banco elas continuam gravadas juntas na coluna "dimensao" ("2 x 1,5 x 1,8").
 */
public record SimulacaoFreteRequest(
    BigDecimal peso,
    BigDecimal distancia,
    BigDecimal comprimento,
    BigDecimal largura,
    BigDecimal altura
) {}
