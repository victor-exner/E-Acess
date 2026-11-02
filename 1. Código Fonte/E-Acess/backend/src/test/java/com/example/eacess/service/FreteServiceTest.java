package com.example.eacess.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.Map;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import com.example.eacess.model.Agendamento;
import com.example.eacess.model.Frete;
import com.example.eacess.model.TarifaFrete;
import com.example.eacess.repository.AgendamentoRepository;
import com.example.eacess.repository.FreteRepository;
import com.example.eacess.repository.TarifaFreteRepository;

/**
 * Testes de aceitação do UC05 - Simular Frete (seção 7 da especificação).
 * Rodam sem banco de dados (repositórios simulados com Mockito).
 */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class FreteServiceTest {

    @Mock
    private FreteRepository freteRepository;

    @Mock
    private TarifaFreteRepository tarifaFreteRepository;

    @Mock
    private AgendamentoRepository agendamentoRepository;

    @InjectMocks
    private FreteService freteService;

    private TarifaFrete tarifa;

    @BeforeEach
    void configurarTarifaPadrao() {
        tarifa = new TarifaFrete();
        tarifa.setId(1);
        tarifa.setTarifaPorKg(new BigDecimal("0.15"));
        tarifa.setTarifaPorKm(new BigDecimal("2.50"));
        tarifa.setFatorCubagem(new BigDecimal("300"));
        tarifa.setValorMinimo(new BigDecimal("150.00"));
        when(tarifaFreteRepository.findFirstByOrderByIdDesc()).thenReturn(Optional.of(tarifa));
        when(tarifaFreteRepository.save(any(TarifaFrete.class))).thenAnswer(i -> i.getArgument(0));
        when(freteRepository.save(any(Frete.class))).thenAnswer(i -> i.getArgument(0));
        when(agendamentoRepository.save(any(Agendamento.class))).thenAnswer(i -> i.getArgument(0));
    }

    private static Frete frete(Double peso, Double distancia, String dimensao) {
        Frete f = new Frete();
        f.setPeso(peso);
        f.setDistancia(distancia);
        f.setDimensao(dimensao);
        return f;
    }

    @SuppressWarnings("unchecked")
    private static Map<String, String> erros(Map<String, Object> resposta) {
        return (Map<String, String>) resposta.get("erros");
    }

    // CT01 - Simular frete com dados válidos
    @Test
    void ct01_simulaComDadosValidos() {
        Map<String, Object> r = freteService.simular(frete(1200.0, 350.0, "2,0 x 1,5 x 1,8"));

        assertNull(r.get("erros"));
        // volume 5,4 m³ x 300 = 1620 kg cubado > 1200 kg real
        assertEquals(new BigDecimal("5.400"), r.get("volume"));
        assertEquals(new BigDecimal("1620.00"), r.get("pesoCubado"));
        assertEquals(new BigDecimal("1620.00"), r.get("pesoTaxavel"));
        // 1620 x 0,15 + 350 x 2,50 = 243 + 875 = 1118,00 (RN06 - duas casas)
        assertEquals(new BigDecimal("1118.00"), r.get("valor"));
        assertEquals("2 x 1,5 x 1,8", r.get("dimensao"));
        assertEquals(false, r.get("valorMinimoAplicado"));
    }

    @Test
    void usaPesoRealQuandoMaiorQueCubado() {
        Map<String, Object> r = freteService.simular(frete(5000.0, 100.0, "1 x 1 x 1"));
        assertEquals(new BigDecimal("5000.00"), r.get("pesoTaxavel"));
        assertEquals(new BigDecimal("1000.00"), r.get("valor")); // 750 + 250
    }

    @Test
    void aplicaValorMinimo() {
        Map<String, Object> r = freteService.simular(frete(10.0, 5.0, "0,5 x 0,5 x 0,5"));
        assertEquals(new BigDecimal("150.00"), r.get("valor"));
        assertEquals(true, r.get("valorMinimoAplicado"));
    }

    // CT02 - Campos obrigatórios [RN01]
    @Test
    void ct02_distanciaObrigatoria() {
        Map<String, Object> r = freteService.simular(frete(1200.0, null, "2 x 1,5 x 1,8"));
        assertEquals("A distância é obrigatória", erros(r).get("distancia"));
        assertNull(erros(r).get("peso"));
    }

    @Test
    void todosCamposObrigatorios() {
        Map<String, Object> r = freteService.simular(frete(null, null, " "));
        assertEquals(3, erros(r).size());
        assertEquals("A dimensão é obrigatória", erros(r).get("dimensao"));
    }

    @Test
    void cadaMedidaEObrigatoria() {
        // A tela monta "C x L x A" com os três campos; altura em branco
        Map<String, Object> r = freteService.simular(frete(1200.0, 350.0, "2 x 1,5 x "));
        assertEquals("A altura é obrigatória", erros(r).get("altura"));
        assertNull(erros(r).get("comprimento"));
    }

    // CT03 - Peso maior que zero [RN02]
    @Test
    void ct03_pesoMaiorQueZero() {
        Map<String, Object> r = freteService.simular(frete(0.0, 350.0, "2 x 1,5 x 1,8"));
        assertEquals("O peso deve ser maior que zero", erros(r).get("peso"));
    }

    @Test
    void maximoDuasCasasDecimais() {
        Map<String, Object> r = freteService.simular(frete(10.123, 350.5, "2 x 1,5 x 1,8"));
        assertEquals("O peso deve ter no máximo duas casas decimais", erros(r).get("peso"));
        assertNull(erros(r).get("distancia"));
    }

    // CT04 - Formato da dimensão [RN03]
    @Test
    void ct04_formatoDimensao() {
        Map<String, Object> r = freteService.simular(frete(1200.0, 350.0, "2x1,5"));
        assertTrue(erros(r).get("dimensao").contains("C x L x A"));
    }

    @Test
    void medidaMaiorQueZeroENumerica() {
        Map<String, Object> r = freteService.simular(frete(1200.0, 350.0, "abc x 0 x 1,8"));
        assertEquals("Informe um número válido", erros(r).get("comprimento"));
        assertEquals("A largura deve ser maior que zero", erros(r).get("largura"));
    }

    // CT05 - Vincular frete ao agendamento [RN05]
    @Test
    void ct05_vinculaFreteAoAgendamento() {
        Agendamento agendamento = new Agendamento();

        Map<String, Object> r = freteService.vincularAoAgendamento(agendamento,
            frete(1200.0, 350.0, "2,0 x 1,5 x 1,8"));

        assertEquals("Frete vinculado ao agendamento!", r.get("mensagem"));
        assertEquals(1118.00, agendamento.getFrete().getValor());
        assertEquals("2 x 1,5 x 1,8", agendamento.getFrete().getDimensao());
        verify(freteRepository).save(any(Frete.class));
        verify(agendamentoRepository).save(agendamento);
    }

    @Test
    void ignoraValorEnviadoPelaTela() {
        Agendamento agendamento = new Agendamento();
        Frete enviado = frete(1200.0, 350.0, "2 x 1,5 x 1,8");
        enviado.setValor(1.0);

        freteService.vincularAoAgendamento(agendamento, enviado);

        assertEquals(1118.00, agendamento.getFrete().getValor());
    }

    // CT06 - Substituir frete existente [FA04]
    @Test
    void ct06_substituiFreteExistente() {
        Frete antigo = frete(1.0, 1.0, "1 x 1 x 1");
        antigo.setId(7);
        Agendamento agendamento = new Agendamento();
        agendamento.setFrete(antigo);

        freteService.vincularAoAgendamento(agendamento, frete(1200.0, 350.0, "2 x 1,5 x 1,8"));

        assertEquals(1118.00, agendamento.getFrete().getValor());
        assertEquals(0, agendamento.getFrete().getId()); // novo registro; o antigo é removido
    }

    @Test
    void naoVinculaFreteInvalido() {
        Agendamento agendamento = new Agendamento();
        Map<String, Object> r = freteService.vincularAoAgendamento(agendamento, frete(0.0, 1.0, "1 x 1 x 1"));

        assertTrue(r.containsKey("erros"));
        assertNull(agendamento.getFrete());
        verify(agendamentoRepository, never()).save(any());
    }

    // CT07 - Descartar simulação [RN07]: simular não grava nada
    @Test
    void ct07_simularNaoGravaNada() {
        freteService.simular(frete(1200.0, 350.0, "2 x 1,5 x 1,8"));
        verify(freteRepository, never()).save(any());
        verify(agendamentoRepository, never()).save(any());
    }

    // CT08 - Recalcular após alterar parâmetro [FA03]
    @Test
    void ct08_recalculaAoAlterarDistancia() {
        Object v350 = freteService.simular(frete(1200.0, 350.0, "2 x 1,5 x 1,8")).get("valor");
        Object v500 = freteService.simular(frete(1200.0, 500.0, "2 x 1,5 x 1,8")).get("valor");
        assertEquals(new BigDecimal("1118.00"), v350);
        assertEquals(new BigDecimal("1493.00"), v500); // +150 km x 2,50
    }

    // CT09 - Tarifas não configuradas [FA05]
    @Test
    void ct09_tarifasNaoConfiguradas() {
        when(tarifaFreteRepository.findFirstByOrderByIdDesc()).thenReturn(Optional.empty());
        Map<String, Object> r = freteService.simular(frete(1200.0, 350.0, "2 x 1,5 x 1,8"));
        assertEquals("Não foi possível calcular o frete: tabela de tarifas não configurada",
            erros(r).get("geral"));
    }

    // Parâmetros do frete [RN04]
    @Test
    void salvaTarifaAtualizandoAVigente() {
        TarifaFrete nova = new TarifaFrete();
        nova.setTarifaPorKg(new BigDecimal("0.20"));
        nova.setTarifaPorKm(new BigDecimal("3.00"));
        nova.setFatorCubagem(new BigDecimal("200"));
        nova.setValorMinimo(new BigDecimal("100.00"));

        Map<String, Object> r = freteService.salvarTarifa(nova);

        assertFalse(r.containsKey("erros"));
        assertEquals(1, ((TarifaFrete) r.get("tarifa")).getId()); // mesmo registro
    }

    @Test
    void novaTarifaMudaOCalculo() {
        tarifa.setFatorCubagem(new BigDecimal("200"));
        // 5,4 m³ x 200 = 1080 kg < 1200 kg real -> 1200 x 0,15 + 875 = 1055,00
        assertEquals(new BigDecimal("1055.00"),
            freteService.simular(frete(1200.0, 350.0, "2 x 1,5 x 1,8")).get("valor"));
    }

    @Test
    void rejeitaTarifaInvalida() {
        TarifaFrete nova = new TarifaFrete();
        nova.setTarifaPorKg(BigDecimal.ZERO);
        nova.setTarifaPorKm(new BigDecimal("3.00"));
        nova.setFatorCubagem(new BigDecimal("200"));
        nova.setValorMinimo(new BigDecimal("-1"));

        Map<String, Object> r = freteService.salvarTarifa(nova);

        assertEquals(2, erros(r).size());
        verify(tarifaFreteRepository, never()).save(any());
    }
}
