package com.example.eacess.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.eacess.dto.SimulacaoFreteRequest;
import com.example.eacess.dto.SimulacaoFreteResponse;
import com.example.eacess.exception.TarifaNaoConfiguradaException;
import com.example.eacess.exception.ValidacaoFreteException;
import com.example.eacess.model.Agendamento;
import com.example.eacess.model.Frete;
import com.example.eacess.model.TarifaFrete;
import com.example.eacess.repository.AgendamentoRepository;
import com.example.eacess.repository.TarifaFreteRepository;

/**
 * Regras do UC05 - Simular Frete.
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

    // Lê a dimensão gravada no banco ("2 x 1,5 x 1,8"); usado quando o frete
    // chega dentro de um agendamento (cadastro). Também aceita "2x1.5x1.8".
    private static final String NUMERO = "(\\d+(?:[.,]\\d+)?)";
    private static final String SEPARADOR = "\\s*[xX×*]\\s*";
    private static final Pattern PADRAO_DIMENSAO = Pattern.compile(
        "^\\s*" + NUMERO + SEPARADOR + NUMERO + SEPARADOR + NUMERO + "\\s*$");

    @Autowired
    private TarifaFreteRepository tarifaFreteRepository;

    @Autowired
    private AgendamentoRepository agendamentoRepository;

    // ===== Simulação (passos 3 e 4 do fluxo principal) =====

    public SimulacaoFreteResponse simular(SimulacaoFreteRequest dados) {
        BigDecimal[] medidas = validar(dados);              // RN01, RN02, RN03 -> FA01
        TarifaFrete tarifa = obterTarifaVigente()
            .orElseThrow(TarifaNaoConfiguradaException::new); // FA05
        return calcular(dados.peso(), dados.distancia(), medidas, tarifa);
    }

    // ===== Vincular frete a um agendamento existente (passos 5 e 6) =====

    @Transactional
    public Optional<Agendamento> vincularAoAgendamento(int agendamentoId, SimulacaoFreteRequest dados) {
        Optional<Agendamento> encontrado = agendamentoRepository.findById(agendamentoId);
        if (encontrado.isEmpty()) {
            return Optional.empty();
        }

        // O valor é sempre recalculado no servidor; nunca confiamos no valor vindo do cliente
        Frete frete = gerarFrete(dados);

        // RN05 - no máximo um frete por agendamento: o novo substitui o anterior
        // (orphanRemoval na entidade Agendamento remove o frete antigo do banco)
        Agendamento agendamento = encontrado.get();
        agendamento.setFrete(frete);
        return Optional.of(agendamentoRepository.save(agendamento));
    }

    // Monta a entidade Frete a partir de uma simulação válida
    public Frete gerarFrete(SimulacaoFreteRequest dados) {
        SimulacaoFreteResponse simulacao = simular(dados);

        Frete frete = new Frete();
        frete.setPeso(simulacao.peso().doubleValue());
        frete.setDistancia(simulacao.distancia().doubleValue());
        frete.setDimensao(simulacao.dimensao());
        frete.setValor(simulacao.valor().doubleValue());
        return frete;
    }

    // Converte um frete recebido dentro do agendamento (com a dimensão em texto)
    // em uma requisição de simulação com as três medidas separadas
    public SimulacaoFreteRequest requisicaoDe(Frete frete) {
        BigDecimal[] medidas = {null, null, null};
        String dimensao = frete.getDimensao();
        if (dimensao != null && !dimensao.isBlank()) {
            Matcher m = PADRAO_DIMENSAO.matcher(dimensao);
            if (!m.matches()) {
                throw new ValidacaoFreteException(Map.of("dimensao",
                    "A dimensão do frete deve estar no formato C x L x A (em metros)"));
            }
            medidas = new BigDecimal[] {
                paraNumero(m.group(1)), paraNumero(m.group(2)), paraNumero(m.group(3))
            };
        }
        return new SimulacaoFreteRequest(
            frete.getPeso() == null ? null : BigDecimal.valueOf(frete.getPeso()),
            frete.getDistancia() == null ? null : BigDecimal.valueOf(frete.getDistancia()),
            medidas[0], medidas[1], medidas[2]);
    }

    // ===== Tabela de tarifas [RN04 / PC03] =====

    public Optional<TarifaFrete> obterTarifaVigente() {
        return tarifaFreteRepository.findFirstByOrderByIdDesc();
    }

    public TarifaFrete salvarTarifa(TarifaFrete tarifa) {
        Map<String, String> erros = new LinkedHashMap<>();
        exigirPositivo(erros, "tarifaPorKg", tarifa.getTarifaPorKg(), "A tarifa por quilo");
        exigirPositivo(erros, "tarifaPorKm", tarifa.getTarifaPorKm(), "A tarifa por quilômetro");
        exigirPositivo(erros, "fatorCubagem", tarifa.getFatorCubagem(), "O fator de cubagem");
        if (tarifa.getValorMinimo() == null || tarifa.getValorMinimo().signum() < 0) {
            erros.put("valorMinimo", "O valor mínimo deve ser maior ou igual a zero");
        }
        if (!erros.isEmpty()) {
            throw new ValidacaoFreteException(erros);
        }

        // Mantém apenas uma tarifa: atualiza a vigente se já existir
        obterTarifaVigente().ifPresent(atual -> tarifa.setId(atual.getId()));
        return tarifaFreteRepository.save(tarifa);
    }

    // ===== Regras de validação =====

    /**
     * Valida os dados conforme RN01, RN02 e RN03.
     * Retorna as medidas [comprimento, largura, altura] validadas.
     */
    BigDecimal[] validar(SimulacaoFreteRequest dados) {
        Map<String, String> erros = new LinkedHashMap<>();

        if (dados == null) {
            dados = new SimulacaoFreteRequest(null, null, null, null, null);
        }

        // RN01 + RN02 - peso (kg) e distância (km)
        validarNumero(erros, "peso", dados.peso(), "O peso", "o");
        validarNumero(erros, "distancia", dados.distancia(), "A distância", "a");

        // RN01 + RN03 - dimensão: comprimento, largura e altura (m)
        validarNumero(erros, "comprimento", dados.comprimento(), "O comprimento", "o");
        validarNumero(erros, "largura", dados.largura(), "A largura", "a");
        validarNumero(erros, "altura", dados.altura(), "A altura", "a");

        if (!erros.isEmpty()) {
            throw new ValidacaoFreteException(erros);
        }
        return new BigDecimal[] { dados.comprimento(), dados.largura(), dados.altura() };
    }

    // ===== Cálculo [RN04] e formatação [RN06] =====

    SimulacaoFreteResponse calcular(BigDecimal peso, BigDecimal distancia,
                                    BigDecimal[] medidas, TarifaFrete tarifa) {
        BigDecimal volume = medidas[0].multiply(medidas[1]).multiply(medidas[2])
            .setScale(3, RoundingMode.HALF_UP);

        BigDecimal pesoCubado = volume.multiply(tarifa.getFatorCubagem())
            .setScale(2, RoundingMode.HALF_UP);

        BigDecimal pesoTaxavel = peso.max(pesoCubado).setScale(2, RoundingMode.HALF_UP);

        BigDecimal valor = pesoTaxavel.multiply(tarifa.getTarifaPorKg())
            .add(distancia.multiply(tarifa.getTarifaPorKm()))
            .setScale(2, RoundingMode.HALF_UP);

        boolean minimoAplicado = valor.compareTo(tarifa.getValorMinimo()) < 0;
        if (minimoAplicado) {
            valor = tarifa.getValorMinimo().setScale(2, RoundingMode.HALF_UP);
        }

        return new SimulacaoFreteResponse(
            peso.setScale(2, RoundingMode.HALF_UP),
            distancia.setScale(2, RoundingMode.HALF_UP),
            formatarDimensao(medidas),
            volume,
            pesoCubado,
            pesoTaxavel,
            valor,
            minimoAplicado
        );
    }

    // ===== Auxiliares =====

    // Obrigatório, maior que zero e com no máximo duas casas decimais
    private static void validarNumero(Map<String, String> erros, String campo,
                                      BigDecimal valor, String nome, String genero) {
        if (valor == null) {
            erros.put(campo, nome + " é obrigatóri" + genero);
        } else if (valor.signum() <= 0) {
            erros.put(campo, nome + " deve ser maior que zero");
        } else if (casasDecimais(valor) > 2) {
            erros.put(campo, nome + " deve ter no máximo duas casas decimais");
        }
    }

    private static int casasDecimais(BigDecimal valor) {
        return Math.max(0, valor.stripTrailingZeros().scale());
    }

    private static BigDecimal paraNumero(String texto) {
        return new BigDecimal(texto.replace(',', '.'));
    }

    // Junta as três medidas no texto gravado no banco. Ex.: 2,0 / 1,5 / 1,8 -> "2 x 1,5 x 1,8"
    private static String formatarDimensao(BigDecimal[] medidas) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < medidas.length; i++) {
            if (i > 0) sb.append(" x ");
            sb.append(medidas[i].stripTrailingZeros().toPlainString().replace('.', ','));
        }
        return sb.toString();
    }

    private static void exigirPositivo(Map<String, String> erros, String campo,
                                       BigDecimal valor, String nome) {
        if (valor == null || valor.signum() <= 0) {
            erros.put(campo, nome + " deve ser maior que zero");
        }
    }
}
