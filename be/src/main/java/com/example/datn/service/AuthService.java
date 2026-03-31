package com.example.datn.service;

import com.example.datn.dto.request.LoginRequest;
import com.example.datn.dto.request.RegisterRequest;
import com.example.datn.dto.response.AuthResponse;

public interface AuthService {
    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);
}
