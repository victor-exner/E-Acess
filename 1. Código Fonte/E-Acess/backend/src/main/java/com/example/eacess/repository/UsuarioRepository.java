package com.example.eacess.repository;

import com.example.eacess.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Integer>{
    boolean existsByLogin(String login);
    Optional<Usuario> findByLogin(String login);
}
