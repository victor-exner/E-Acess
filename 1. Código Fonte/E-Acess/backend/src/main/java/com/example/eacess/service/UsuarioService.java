package com.example.eacess.service;

import com.example.eacess.model.Usuario;
import com.example.eacess.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service 
public class UsuarioService {
    
    @Autowired 
    private UsuarioRepository usuarioRepository;

    // Listar todos os usuários
    public List<Usuario> listarTodos(){
        return usuarioRepository.findAll();
    }

    // Buscar usuário por ID
    public Optional<Usuario> buscarPorId(int id){
        return usuarioRepository.findById(id);
    }

    // Salvar ou atualizar usuário
    public Usuario salvar(Usuario usuario){
        return usuarioRepository.save(usuario);
    }

    // Excluir usuário por Id
    public void excluir(int id){
        usuarioRepository.deleteById(id);
    }

    // Autenticar usuário
    public Optional<Usuario> autenticar(String login, String senha){
        Optional<Usuario> usuarioEncontrado = usuarioRepository.findByLogin(login);

        if(usuarioEncontrado.isPresent() && usuarioEncontrado.get().getSenha().equals(senha)){
                return usuarioEncontrado;
        }
        return Optional.empty();
    }
}
