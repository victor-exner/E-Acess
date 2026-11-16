package com.example.eacess.service;

import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.eacess.model.Motorista;
import com.example.eacess.repository.AgendamentoRepository;
import com.example.eacess.repository.MotoristaRepository;

@Service
public class MotoristaService {

    @Autowired
    private MotoristaRepository motoristaRepository;

    @Autowired
    private AgendamentoRepository agendamentoRepository;

    public List<Motorista> listarTodos() {
        return motoristaRepository.findAll();
    }

    public Optional<Motorista> buscarPorId(int id) {
        return motoristaRepository.findById(id);
    }

    // FA04 - Pesquisar motoristas
    public List<Motorista> pesquisar(String termo) {
        if (termo == null || termo.isBlank()) {
            return motoristaRepository.findAll();
        }
        String busca = termo.trim();
        return motoristaRepository.findByNomeContainingIgnoreCaseOrDocumentoContaining(busca, busca);
    }

    // RN01, RN02, RN03 - Validação e Cadastro
    public Motorista cadastrar(Motorista motorista) {
        validarRegras(motorista);

        // RN03: Documento único
        if (motoristaRepository.findByDocumento(motorista.getDocumento()).isPresent()) {
            throw new IllegalArgumentException("Documento já cadastrado");
        }

        return motoristaRepository.save(motorista);
    }

    // FA02 - Alterar motorista
    public Motorista atualizar(int id, Motorista dadosAtualizados) {
        Motorista motoristaExistente = motoristaRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Motorista não encontrado"));

        validarRegras(dadosAtualizados);

        // RN03: Se alterou o documento, checa se outro motorista já o utiliza
        Optional<Motorista> motoristaComMesmoDoc = motoristaRepository.findByDocumento(dadosAtualizados.getDocumento());
        if (motoristaComMesmoDoc.isPresent() && motoristaComMesmoDoc.get().getId() != id) {
            throw new IllegalArgumentException("Documento já cadastrado");
        }

        motoristaExistente.setNome(dadosAtualizados.getNome().trim());
        motoristaExistente.setDocumento(dadosAtualizados.getDocumento().trim());

        return motoristaRepository.save(motoristaExistente);
    }

    // FA03 / RN04 - Excluir motorista
    public void excluir(int id) {
        if (!motoristaRepository.existsById(id)) {
            throw new IllegalArgumentException("Motorista não encontrado");
        }

        // RN04: Bloqueia exclusão se houver agendamento vinculado
        if (agendamentoRepository.existsByMotoristaId(id)) {
            throw new IllegalStateException("Motorista vinculado a agendamentos não pode ser excluído");
        }

        motoristaRepository.deleteById(id);
    }

    // Validações comuns (RN01, RN02, RN03)
    private void validarRegras(Motorista motorista) {
        // RN01 - Campos obrigatórios
        if (motorista.getNome() == null || motorista.getNome().trim().isEmpty()) {
            throw new IllegalArgumentException("O nome é obrigatório");
        }
        if (motorista.getDocumento() == null || motorista.getDocumento().trim().isEmpty()) {
            throw new IllegalArgumentException("O documento é obrigatório");
        }

        // RN02 - Tamanho do nome
        if (motorista.getNome().trim().length() > 64) {
            throw new IllegalArgumentException("O nome deve ter no máximo 64 caracteres");
        }

        // RN03 - Documento somente numérico
        if (!motorista.getDocumento().trim().matches("^\\d+$")) {
            throw new IllegalArgumentException("O documento deve conter apenas números");
        }
    }
}