package com.example.eacess.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.example.eacess.model.Motorista;

@Repository
public interface MotoristaRepository extends JpaRepository<Motorista, Integer> {
    
    // Verifica documento único (RN03)
    Optional<Motorista> findByDocumento(String documento);
    
    // FA04 - Pesquisa por parte do nome ou documento
    List<Motorista> findByNomeContainingIgnoreCaseOrDocumentoContaining(String nome, String documento);
}