package com.example.eacess.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.example.eacess.model.Transportadora;

@Repository
public interface TransportadoraRepository extends JpaRepository<Transportadora, Integer> {

    // Verifica nome único, sem diferenciar maiúsculas de minúsculas (RN02)
    Optional<Transportadora> findByNomeIgnoreCase(String nome);

    // FA04 - Pesquisa por parte do nome
    List<Transportadora> findByNomeContainingIgnoreCase(String nome);
}
