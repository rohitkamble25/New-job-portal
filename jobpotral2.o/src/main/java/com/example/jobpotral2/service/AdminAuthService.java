package com.example.jobpotral2.service;

import com.example.jobpotral2.dto.AdminRegisterRequest;
import com.example.jobpotral2.dto.AuthResponse;
import com.example.jobpotral2.dto.LoginRequest;

public interface AdminAuthService {
    AuthResponse registerFirstAdmin(AdminRegisterRequest request);

    AuthResponse login(LoginRequest request);
}
