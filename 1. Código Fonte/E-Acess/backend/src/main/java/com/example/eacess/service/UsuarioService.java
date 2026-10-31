package com.example.eacess.service;

import com.example.eacess.model.Usuario;
import com.example.eacess.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service 
public class UsuarioService {
    
    @Autowired 
    private UsuarioRepository usuarioRepository;

    // objeto responsável por criptografar e verificar senhas
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    // Listar todos os usuários
    public List<Usuario> listarTodos(){
        return usuarioRepository.findAll();
    }

    // Buscar usuário por ID
    public Optional<Usuario> buscarPorId(int id){
        return usuarioRepository.findById(id);
    }

    // Salvar ou atualizar usuário + criptografando senha
    public Usuario salvar(Usuario usuario){
        if(usuario.getSenha() == null || usuario.getSenha().isBlank()){
            throw new IllegalArgumentException("A senha não pode estar vazia");
        }

        String senhaCriptografada = passwordEncoder.encode(usuario.getSenha());

        usuario.setSenha(senhaCriptografada);

        return usuarioRepository.save(usuario);
    }

    // Excluir usuário por Id
    public void excluir(int id){
        usuarioRepository.deleteById(id);
    }

    // Autenticar usuário
    public Optional<Usuario> autenticar(String login, String senha){
        Optional<Usuario> usuarioEncontrado = usuarioRepository.findByLogin(login);

        if(usuarioEncontrado.isPresent()){
            Usuario usuario = usuarioEncontrado.get();
        
            // comparando senha inserida e o hash armazenado
            boolean senhaCorreta = passwordEncoder.matches(
                senha, usuario.getSenha()
            );

            if(senhaCorreta) {
              return Optional.of(usuario);  
            }
        }
        return Optional.empty();
    }
}
