package com.example.eacess.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

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
 * Testes de aceitação do UC05 - Simular Frete (seção 7 da especificação).
 * Rodam sem banco de dados (repositórios simulados com Mockito).
 */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class FreteServiceTest {

    @Mock
    private TarifaFreteRepository tarifaFreteRepository;

    @Mock
    private AgendamentoRepository agendamentoRepository;

    @InjectMocks
    private FreteService freteService;

    @BeforeEach
    void configurarTarifaPadrao() {
        TarifaFrete tarifa = new TarifaFrete();
        tarifa.setTarifaPorKg(new BigDecimal("0.15"));
        tarifa.setTarifaPorKm(new BigDecimal("2.50"));
        tarifa.setFatorCubagem(new BigDecimal("300"));
        tarifa.setValorMinimo(new BigDecimal("150.00"));
        when(tarifaFreteRepository.findFirstByOrderByIdDesc()).thenReturn(Optional.of(tarifa));
        when(agendamentoRepository.save(any(Agendamento.class))).thenAnswer(i -> i.getArgument(0));
    }

    private static BigDecimal num(String valor) {
        return valor == null ? null : new BigDecimal(valor);
    }

    private static SimulacaoFreteRequest req(String peso, String distancia,
                                             String comprimento, String largura, String altura) {
        return new SimulacaoFreteRequest(num(peso), num(distancia),
            num(comprimento), num(largura), num(altura));
    }

    private static String erroDe(ValidacaoFreteException e, String campo) {
        return e.getErros().get(campo);
    }

    // CT01 - Simular frete com dados válidos
    @Test
    void ct01_simulaComDadosValidos() {
        SimulacaoFreteResponse r = freteService.simular(req("1200", "350", "2.0", "1.5", "1.8"));

        // volume 5,4 m³ x 300 = 1620 kg cubado > 1200 kg real
        assertEquals(new BigDecimal("5.400"), r.volume());
        assertEquals(new BigDecimal("1620.00"), r.pesoCubado());
        assertEquals(new BigDecimal("1620.00"), r.pesoTaxavel());
        // 1620 x 0,15 + 350 x 2,50 = 243 + 875 = 1118,00
        assertEquals(new BigDecimal("1118.00"), r.valor());
        assertEquals(2, r.valor().scale()); // RN06 - duas casas
        assertEquals("2 x 1,5 x 1,8", r.dimensao());
        assertFalse(r.valorMinimoAplicado());
    }

    @Test
    void usaPesoRealQuandoMaiorQueCubado() {
        SimulacaoFreteResponse r = freteService.simular(req("5000", "100", "1", "1", "1"));
        assertEquals(new BigDecimal("5000.00"), r.pesoTaxavel());
        // 5000 x 0,15 + 100 x 2,50 = 750 + 250
        assertEquals(new BigDecimal("1000.00"), r.valor());
    }

    @Test
    void aplicaValorMinimo() {
        SimulacaoFreteResponse r = freteService.simular(req("10", "5", "0.5", "0.5", "0.5"));
        assertEquals(new BigDecimal("150.00"), r.valor());
        assertTrue(r.valorMinimoAplicado());
    }

    // CT02 - Campos obrigatórios [RN01]
    @Test
    void ct02_distanciaObrigatoria() {
        ValidacaoFreteException e = assertThrows(ValidacaoFreteException.class,
            () -> freteService.simular(req("1200", null, "2", "1.5", "1.8")));
        assertEquals("A distância é obrigatória", erroDe(e, "distancia"));
        assertNull(erroDe(e, "peso"));
    }

    @Test
    void todosCamposObrigatorios() {
        ValidacaoFreteException e = assertThrows(ValidacaoFreteException.class,
            () -> freteService.simular(req(null, null, null, null, null)));
        assertEquals(5, e.getErros().size());
        assertEquals("O comprimento é obrigatório", erroDe(e, "comprimento"));
        assertEquals("A largura é obrigatória", erroDe(e, "largura"));
        assertEquals("A altura é obrigatória", erroDe(e, "altura"));
    }

    // CT03 - Peso maior que zero [RN02]
    @Test
    void ct03_pesoMaiorQueZero() {
        ValidacaoFreteException e = assertThrows(ValidacaoFreteException.class,
            () -> freteService.simular(req("0", "350", "2", "1.5", "1.8")));
        assertEquals("O peso deve ser maior que zero", erroDe(e, "peso"));
    }

    @Test
    void maximoDuasCasasDecimais() {
        ValidacaoFreteException e = assertThrows(ValidacaoFreteException.class,
            () -> freteService.simular(req("10.123", "350.5", "2", "1.5", "1.8")));
        assertEquals("O peso deve ter no máximo duas casas decimais", erroDe(e, "peso"));
        assertNull(erroDe(e, "distancia"));
    }

    // CT04 - Dimensão em três medidas [RN03]
    @Test
    void ct04_alturaObrigatoria() {
        ValidacaoFreteException e = assertThrows(ValidacaoFreteException.class,
            () -> freteService.simular(req("1200", "350", "2", "1.5", null)));
        assertEquals("A altura é obrigatória", erroDe(e, "altura"));
        assertNull(erroDe(e, "comprimento"));
        assertNull(erroDe(e, "largura"));
    }

    @Test
    void medidaComMaximoDuasCasasDecimais() {
        ValidacaoFreteException e = assertThrows(ValidacaoFreteException.class,
            () -> freteService.simular(req("1200", "350", "2.555", "1.5", "1.8")));
        assertEquals("O comprimento deve ter no máximo duas casas decimais", erroDe(e, "comprimento"));
    }

    @Test
    void medidaDaDimensaoMaiorQueZero() {
        ValidacaoFreteException e = assertThrows(ValidacaoFreteException.class,
            () -> freteService.simular(req("1200", "350", "2", "0", "1.8")));
        assertEquals("A largura deve ser maior que zero", erroDe(e, "largura"));
    }

    @Test
    void gravaDimensaoComoUmTextoSo() {
        assertEquals("2 x 1,5 x 1,8", freteService.simular(req("1", "1", "2.00", "1.5", "1.80")).dimensao());
    }

    // Frete enviado dentro do cadastro de agendamento (dimensão em texto)
    @Test
    void leDimensaoDoFreteDoAgendamento() {
        Frete frete = new Frete();
        frete.setPeso(1200.0);
        frete.setDistancia(350.0);
        frete.setDimensao("2 x 1,5 x 1,8");
        SimulacaoFreteRequest r = freteService.requisicaoDe(frete);
        assertEquals(0, new BigDecimal("2").compareTo(r.comprimento()));
        assertEquals(0, new BigDecimal("1.5").compareTo(r.largura()));
        assertEquals(0, new BigDecimal("1.8").compareTo(r.altura()));
        assertEquals(new BigDecimal("1118.00"), freteService.simular(r).valor());
    }

    // CT05 - Vincular frete ao agendamento [RN05]
    @Test
    void ct05_vinculaFreteAoAgendamento() {
        Agendamento agendamento = new Agendamento();
        when(agendamentoRepository.findById(1)).thenReturn(Optional.of(agendamento));

        Agendamento salvo = freteService.vincularAoAgendamento(1, req("1200", "350", "2", "1.5", "1.8")).orElseThrow();

        assertEquals(1118.00, salvo.getFrete().getValor());
        assertEquals("2 x 1,5 x 1,8", salvo.getFrete().getDimensao());
        verify(agendamentoRepository).save(agendamento);
    }

    // CT06 - Substituir frete existente [FA04]
    @Test
    void ct06_substituiFreteExistente() {
        Frete antigo = new Frete();
        antigo.setId(7);
        antigo.setValor(500.0);
        Agendamento agendamento = new Agendamento();
        agendamento.setFrete(antigo);
        when(agendamentoRepository.findById(1)).thenReturn(Optional.of(agendamento));

        Agendamento salvo = freteService.vincularAoAgendamento(1, req("1200", "350", "2", "1.5", "1.8")).orElseThrow();

        assertEquals(1118.00, salvo.getFrete().getValor());
        assertEquals(0, salvo.getFrete().getId()); // novo registro; o antigo é removido (orphanRemoval)
    }

    @Test
    void vincularAgendamentoInexistenteRetornaVazio() {
        when(agendamentoRepository.findById(99)).thenReturn(Optional.empty());
        assertTrue(freteService.vincularAoAgendamento(99, req("1", "1", "1", "1", "1")).isEmpty());
    }

    // CT07 - Descartar simulação [RN07]: simular não grava nada
    @Test
    void ct07_simularNaoGravaNada() {
        freteService.simular(req("1200", "350", "2", "1.5", "1.8"));
        verify(agendamentoRepository, never()).save(any());
    }

    // CT08 - Recalcular após alterar parâmetro [FA03]
    @Test
    void ct08_recalculaAoAlterarDistancia() {
        BigDecimal v350 = freteService.simular(req("1200", "350", "2", "1.5", "1.8")).valor();
        BigDecimal v500 = freteService.simular(req("1200", "500", "2", "1.5", "1.8")).valor();
        assertEquals(new BigDecimal("1118.00"), v350);
        assertEquals(new BigDecimal("1493.00"), v500); // +150 km x 2,50
    }

    // CT09 - Tarifas não configuradas [FA05]
    @Test
    void ct09_tarifasNaoConfiguradas() {
        when(tarifaFreteRepository.findFirstByOrderByIdDesc()).thenReturn(Optional.empty());
        TarifaNaoConfiguradaException e = assertThrows(TarifaNaoConfiguradaException.class,
            () -> freteService.simular(req("1200", "350", "2", "1.5", "1.8")));
        assertEquals("Não foi possível calcular o frete: tabela de tarifas não configurada", e.getMessage());
    }

    // Parâmetros do frete editados pela tela
    @Test
    void salvaTarifaSubstituindoAVigente() {
        TarifaFrete vigente = tarifaFreteRepository.findFirstByOrderByIdDesc().orElseThrow();
        vigente.setId(3);
        when(tarifaFreteRepository.save(any(TarifaFrete.class))).thenAnswer(i -> i.getArgument(0));

        TarifaFrete nova = new TarifaFrete();
        nova.setTarifaPorKg(new BigDecimal("0.20"));
        nova.setTarifaPorKm(new BigDecimal("3.00"));
        nova.setFatorCubagem(new BigDecimal("200"));
        nova.setValorMinimo(new BigDecimal("100.00"));

        assertEquals(3, freteService.salvarTarifa(nova).getId());
    }

    @Test
    void rejeitaTarifaInvalida() {
        TarifaFrete nova = new TarifaFrete();
        nova.setTarifaPorKg(BigDecimal.ZERO);
        nova.setTarifaPorKm(new BigDecimal("3.00"));
        nova.setFatorCubagem(new BigDecimal("200"));
        nova.setValorMinimo(new BigDecimal("-1"));

        ValidacaoFreteException e = assertThrows(ValidacaoFreteException.class,
            () -> freteService.salvarTarifa(nova));
        assertEquals(2, e.getErros().size());
        verify(tarifaFreteRepository, never()).save(any());
    }
}
