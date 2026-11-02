package com.example.eacess.dto;

import java.math.BigDecimal;

/**
 * Resultado da simulação (UC05 - passo 4). Tem caráter de estimativa [RN06].
 * Os campos intermediários (volume, peso cubado, peso taxável) são
 * devolvidos para que o usuário entenda como o valor foi calculado.
 */
public record SimulacaoFreteResponse(
    BigDecimal peso,
    BigDecimal distancia,
    String dimensao,
    BigDecimal volume,
    BigDecimal pesoCubado,
    BigDecimal pesoTaxavel,
    BigDecimal valor,
    boolean valorMinimoAplicado
) {}
