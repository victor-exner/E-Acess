package com.example.eacess.service;

import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.eacess.model.Transportadora;
import com.example.eacess.repository.AgendamentoRepository;
import com.example.eacess.repository.TransportadoraRepository;

@Service
public class TransportadoraService {

    @Autowired
    private TransportadoraRepository transportadoraRepository;

    @Autowired
    private AgendamentoRepository agendamentoRepository;

    public List<Transportadora> listarTodos() {
        return transportadoraRepository.findAll();
    }

    public Optional<Transportadora> buscarPorId(int id) {
        return transportadoraRepository.findById(id);
    }

    // FA04 - Pesquisar transportadoras
    public List<Transportadora> pesquisar(String termo) {
        if (termo == null || termo.isBlank()) {
            return transportadoraRepository.findAll();
        }
        return transportadoraRepository.findByNomeContainingIgnoreCase(termo.trim());
    }

    // RN01, RN02 - Validação e Cadastro
    public Transportadora cadastrar(Transportadora transportadora) {
        validarRegras(transportadora);

        String nome = transportadora.getNome().trim();

        // RN02: Nome único
        if (transportadoraRepository.findByNomeIgnoreCase(nome).isPresent()) {
            throw new IllegalArgumentException("Transportadora já cadastrada");
        }

        transportadora.setNome(nome);
        return transportadoraRepository.save(transportadora);
    }

    // FA02 - Alterar transportadora
    public Transportadora atualizar(int id, Transportadora dadosAtualizados) {
        Transportadora transportadoraExistente = transportadoraRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Transportadora não encontrada"));

        validarRegras(dadosAtualizados);

        String nome = dadosAtualizados.getNome().trim();

        // RN02: Se alterou o nome, checa se outra transportadora já o utiliza
        Optional<Transportadora> transportadoraComMesmoNome = transportadoraRepository.findByNomeIgnoreCase(nome);
        if (transportadoraComMesmoNome.isPresent() && transportadoraComMesmoNome.get().getId() != id) {
            throw new IllegalArgumentException("Transportadora já cadastrada");
        }

        transportadoraExistente.setNome(nome);

        return transportadoraRepository.save(transportadoraExistente);
    }

    // FA03 / RN03 - Excluir transportadora
    public void excluir(int id) {
        if (!transportadoraRepository.existsById(id)) {
            throw new IllegalArgumentException("Transportadora não encontrada");
        }

        // RN03: Bloqueia exclusão se houver veículo (agendamento) vinculado
        if (!agendamentoRepository.findByTransportadoraId(id).isEmpty()) {
            throw new IllegalStateException("Transportadora com veículos vinculados não pode ser excluída");
        }

        transportadoraRepository.deleteById(id);
    }

    // Validações comuns (RN01)
    private void validarRegras(Transportadora transportadora) {
        // RN01 - Nome obrigatório
        if (transportadora.getNome() == null || transportadora.getNome().trim().isEmpty()) {
            throw new IllegalArgumentException("O nome é obrigatório");
        }

        // RN01 - Tamanho do nome
        if (transportadora.getNome().trim().length() > 64) {
            throw new IllegalArgumentException("O nome deve ter no máximo 64 caracteres");
        }
    }
}
