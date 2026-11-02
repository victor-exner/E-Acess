package com.example.eacess.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.eacess.model.TarifaFrete;

public interface TarifaFreteRepository extends JpaRepository<TarifaFrete, Integer> {
    // Tarifa vigente = a mais recente cadastrada
    Optional<TarifaFrete> findFirstByOrderByIdDesc();
}
