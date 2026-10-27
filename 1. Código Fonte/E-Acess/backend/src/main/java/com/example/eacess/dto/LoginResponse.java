package com.example.eacess.dto;

public class LoginResponse {

    private int id;
    private String login;
    private boolean adm;

    public LoginResponse(int id, String login, boolean adm) {
        this.id = id;
        this.login = login;
        this.adm = adm;
    }

    public int getId() {
        return id;
    }

    public String getLogin() {
        return login;
    }

    public boolean isAdm() {
        return adm;
    }
}