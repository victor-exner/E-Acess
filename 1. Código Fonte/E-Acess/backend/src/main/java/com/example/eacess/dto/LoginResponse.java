package com.example.eacess.dto;

import com.example.eacess.model.Setor;

public class LoginResponse {

    private final int id;
    private final String login;
    private final Setor setor;

    public LoginResponse(int id, String login, Setor setor) {
        this.id = id;
        this.login = login;
        this.setor = setor;
    }

    public int getId() {
        return id;
    }

    public String getLogin() {
        return login;
    }

    public Setor getSetor() {
        return setor;
    }
}