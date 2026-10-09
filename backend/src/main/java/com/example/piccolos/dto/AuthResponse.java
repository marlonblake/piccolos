package com.example.piccolos.dto;

public class AuthResponse {
    private String token;
    private Integer userId;

    public AuthResponse(String token, Integer userId) {
        this.token = token;
        this.userId = userId;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public Integer getUserId() { return userId; }
    public void setUserId(Integer userId) { this.userId = userId; }
}