package com.example.jobpotral2.service;

import com.example.jobpotral2.dto.AuthResponse;
import com.example.jobpotral2.dto.LoginRequest;
import com.example.jobpotral2.dto.RegisterRequest;
import com.example.jobpotral2.dto.UserResponse;

public interface AuthService {
    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    UserResponse getProfile(String email);

}
