package com.example.eacess.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.eacess.model.Agendamento;
import com.example.eacess.model.Frete;
import com.example.eacess.repository.AgendamentoRepository;
import com.example.eacess.repository.FreteRepository;

/**
 * UC05 - Simular Frete.
 *
 * Toda validação, tratamento de erro e conversão de dados fica aqui.
 * Quando algo dá errado, os métodos devolvem um Map com:
 *   "mensagem" -> texto para exibir
 *   "erros"    -> erro de cada campo (peso, distancia, comprimento, largura,
 *                 altura, dimensao, campos da tarifa) ou "geral"
 *
 * Fórmula [RN04]:
 *   volume       = comprimento x largura x altura              (m³)
 *   pesoCubado   = volume x fatorCubagem                        (kg)
 *   pesoTaxavel  = maior valor entre peso real e peso cubado    (kg)
 *   valor        = pesoTaxavel x tarifaPorKg + distancia x tarifaPorKm
 *   se valor < valorMinimo, cobra-se o valor mínimo
 */
@Service
public class FreteService {

    // ===== Parâmetros do cálculo do frete [RN04] =====
    // Valores fixos: para mudar, altere aqui e reinicie o sistema.
    private static final BigDecimal TARIFA_POR_KG = new BigDecimal("0.15");   // R$ por kg
    private static final BigDecimal TARIFA_POR_KM = new BigDecimal("2.50");   // R$ por km
    private static final BigDecimal FATOR_CUBAGEM = new BigDecimal("200");    // kg por m³
    private static final BigDecimal VALOR_MINIMO  = new BigDecimal("150.00"); // R$

    // A dimensão chega como um texto só: "comprimento x largura x altura"
    private static final String SEPARADOR_DIMENSAO = "\\s*[xX×*]\\s*";

    @Autowired
    private FreteRepository freteRepository;

    @Autowired
    private AgendamentoRepository agendamentoRepository;

    // ===== 1. Simular (passos 3 e 4) - não grava nada [RN07] =====
    public Map<String, Object> simular(Frete dados) {
        Map<String, String> erros = new LinkedHashMap<>();
        BigDecimal[] medidas = validar(dados, erros);
        if (!erros.isEmpty()) {
            return respostaDeErro(erros);
        }

        return calcular(dados, medidas);
    }

    // ===== 2. Vincular ao agendamento (passos 5 e 6) [RN05] =====
    public Optional<Agendamento> buscarAgendamento(int id) {
        return agendamentoRepository.findById(id);
    }

    @Transactional
    public Map<String, Object> vincularAoAgendamento(Agendamento agendamento, Frete dados) {
        // O valor é sempre recalculado aqui; o valor enviado pela tela é ignorado
        Map<String, Object> simulacao = simular(dados);
        if (simulacao.containsKey("erros")) {
            return simulacao;
        }

        Frete frete = new Frete();
        frete.setPeso(dados.getPeso());
        frete.setDistancia(dados.getDistancia());
        frete.setDimensao((String) simulacao.get("dimensao"));
        frete.setValor(((BigDecimal) simulacao.get("valor")).doubleValue());

        // RN05 - o novo frete substitui o anterior
        // (orphanRemoval na entidade Agendamento apaga o antigo)
        agendamento.setFrete(freteRepository.save(frete));

        Map<String, Object> resposta = new LinkedHashMap<>();
        resposta.put("mensagem", "Frete vinculado ao agendamento!");
        resposta.put("agendamento", agendamentoRepository.save(agendamento));
        return resposta;
    }

    // ===== Validação [RN01, RN02, RN03] =====

    /**
     * Preenche "erros" com os problemas encontrados e devolve as medidas
     * [comprimento, largura, altura] convertidas (ou null se inválidas).
     */
    BigDecimal[] validar(Frete dados, Map<String, String> erros) {
        if (dados == null) {
            dados = new Frete();
        }

        // RN01 + RN02 - peso (kg) e distância (km)
        validarPositivoDuasCasas(erros, "peso", dados.getPeso(), "O peso", "obrigatório");
        validarPositivoDuasCasas(erros, "distancia", dados.getDistancia(), "A distância", "obrigatória");

        // RN01 + RN03 - dimensão "C x L x A" (m)
        return lerDimensao(dados.getDimensao(), erros);
    }

    // Converte "2,0 x 1,5 x 1,8" em três números, validando cada medida
    private BigDecimal[] lerDimensao(String dimensao, Map<String, String> erros) {
        if (dimensao == null || dimensao.isBlank()) {
            erros.put("dimensao", "A dimensão é obrigatória");
            return null;
        }

        String[] partes = dimensao.trim().split(SEPARADOR_DIMENSAO, -1);
        if (partes.length != 3) {
            erros.put("dimensao",
                "A dimensão deve estar no formato C x L x A (em metros). Ex.: 2,0 x 1,5 x 1,8");
            return null;
        }

        String[][] campos = {
            {"comprimento", "O comprimento", "obrigatório"},
            {"largura", "A largura", "obrigatória"},
            {"altura", "A altura", "obrigatória"},
        };
        BigDecimal[] medidas = new BigDecimal[3];
        boolean valido = true;

        for (int i = 0; i < 3; i++) {
            String campo = campos[i][0], nome = campos[i][1];
            String texto = partes[i].trim();

            if (texto.isEmpty()) {
                erros.put(campo, nome + " é " + campos[i][2]);
                valido = false;
                continue;
            }
            try {
                medidas[i] = new BigDecimal(texto.replace(',', '.'));
            } catch (NumberFormatException e) {
                erros.put(campo, "Informe um número válido");
                valido = false;
                continue;
            }
            if (medidas[i].signum() <= 0) {
                erros.put(campo, nome + " deve ser maior que zero");
                valido = false;
            }
        }
        return valido ? medidas : null;
    }

    // ===== Cálculo [RN04] e formatação [RN06] =====
    Map<String, Object> calcular(Frete dados, BigDecimal[] medidas) {
        BigDecimal peso = BigDecimal.valueOf(dados.getPeso()).setScale(2, RoundingMode.HALF_UP);
        BigDecimal distancia = BigDecimal.valueOf(dados.getDistancia()).setScale(2, RoundingMode.HALF_UP);

        BigDecimal volume = medidas[0].multiply(medidas[1]).multiply(medidas[2])
            .setScale(3, RoundingMode.HALF_UP);
        BigDecimal pesoCubado = volume.multiply(FATOR_CUBAGEM)
            .setScale(2, RoundingMode.HALF_UP);
        BigDecimal pesoTaxavel = peso.max(pesoCubado);

        BigDecimal valor = pesoTaxavel.multiply(TARIFA_POR_KG)
            .add(distancia.multiply(TARIFA_POR_KM))
            .setScale(2, RoundingMode.HALF_UP);

        boolean minimoAplicado = valor.compareTo(VALOR_MINIMO) < 0;
        if (minimoAplicado) {
            valor = VALOR_MINIMO;
        }

        // Os valores intermediários mostram ao usuário como o valor foi calculado
        Map<String, Object> resultado = new LinkedHashMap<>();
        resultado.put("peso", peso);
        resultado.put("distancia", distancia);
        resultado.put("dimensao", formatarDimensao(medidas));
        resultado.put("volume", volume);
        resultado.put("pesoCubado", pesoCubado);
        resultado.put("pesoTaxavel", pesoTaxavel);
        resultado.put("valor", valor);
        resultado.put("valorMinimoAplicado", minimoAplicado);
        return resultado;
    }

    // ===== Auxiliares =====

    private static Map<String, Object> respostaDeErro(Map<String, String> erros) {
        Map<String, Object> resposta = new LinkedHashMap<>();
        resposta.put("mensagem", String.join("; ", erros.values()));
        resposta.put("erros", erros);
        return resposta;
    }

    // Obrigatório, maior que zero e com no máximo duas casas decimais [RN02]
    private static void validarPositivoDuasCasas(Map<String, String> erros, String campo,
                                                 Double valor, String nome, String obrigatorio) {
        if (valor == null) {
            erros.put(campo, nome + " é " + obrigatorio);
        } else if (valor <= 0) {
            erros.put(campo, nome + " deve ser maior que zero");
        } else if (BigDecimal.valueOf(valor).stripTrailingZeros().scale() > 2) {
            erros.put(campo, nome + " deve ter no máximo duas casas decimais");
        }
    }


    // Grava a dimensão sempre no mesmo formato. Ex.: 2,0 / 1.5 / 1,80 -> "2 x 1,5 x 1,8"
    private static String formatarDimensao(BigDecimal[] medidas) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < medidas.length; i++) {
            if (i > 0) sb.append(" x ");
            sb.append(medidas[i].stripTrailingZeros().toPlainString().replace('.', ','));
        }
        return sb.toString();
    }
}
