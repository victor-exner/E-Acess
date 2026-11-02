package com.example.eacess.config;

import java.math.BigDecimal;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.example.eacess.model.TarifaFrete;
import com.example.eacess.repository.TarifaFreteRepository;

/**
 * PC03 - Cria uma tabela de tarifas padrão na primeira execução,
 * caso ainda não exista nenhuma. Para testar o FA05 (tarifas não
 * configuradas), defina eacess.frete.criar-tarifa-padrao=false e
 * apague os registros da tabela "tarifas_frete".
 */
@Component
public class TarifaFreteInicializador implements CommandLineRunner {

    private final TarifaFreteRepository repository;
    private final boolean criarTarifaPadrao;

    public TarifaFreteInicializador(TarifaFreteRepository repository,
            @Value("${eacess.frete.criar-tarifa-padrao:true}") boolean criarTarifaPadrao) {
        this.repository = repository;
        this.criarTarifaPadrao = criarTarifaPadrao;
    }

    @Override
    public void run(String... args) {
        if (!criarTarifaPadrao || repository.count() > 0) {
            return;
        }

        TarifaFrete tarifa = new TarifaFrete();
        tarifa.setTarifaPorKg(new BigDecimal("0.15"));   // R$ 0,15 por kg taxável
        tarifa.setTarifaPorKm(new BigDecimal("2.50"));   // R$ 2,50 por km
        tarifa.setFatorCubagem(new BigDecimal("300"));   // 300 kg por m³ (padrão rodoviário)
        tarifa.setValorMinimo(new BigDecimal("150.00")); // R$ 150,00 mínimo
        repository.save(tarifa);
    }
}
