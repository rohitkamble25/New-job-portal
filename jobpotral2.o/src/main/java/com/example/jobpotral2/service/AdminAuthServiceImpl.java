package com.example.jobpotral2.service;

import com.example.jobpotral2.dto.AdminRegisterRequest;
import com.example.jobpotral2.dto.AuthResponse;
import com.example.jobpotral2.dto.LoginRequest;
import com.example.jobpotral2.entity.User;
import com.example.jobpotral2.enums.Role;
import com.example.jobpotral2.repo.UserRepo;
import com.example.jobpotral2.security.BadRequestException;
import com.example.jobpotral2.security.JwtService;

import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminAuthServiceImpl implements AdminAuthService {

    private final UserRepo userRepo;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;

    @Value("${app.admin.bootstrap-enabled:false}")
    private boolean bootstrapEnabled;

    @Override
    @Transactional
    public AuthResponse registerFirstAdmin(AdminRegisterRequest request) {

        if (!bootstrapEnabled) {
            throw new BadRequestException("Admin registration is disabled");
        }

        if (userRepo.existsByRole(Role.ROLE_ADMIN)) {
            throw new BadRequestException("An admin account already exists");
        }

        if (userRepo.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already registered: " + request.getEmail());
        }

        User admin = User.builder()
                .fullName(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phoneNumber(request.getPhoneNumber())
                .role(Role.ROLE_ADMIN)
                .isActive(true)
                .build();

        userRepo.save(admin);

        String token = jwtService.generateToken(admin);

        return new AuthResponse(
                token,
                admin.getId(),
                admin.getFullName(),
                admin.getEmail(),
                admin.getRole());
    }

    @Override
    public AuthResponse login(LoginRequest request) {

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.email(),
                        request.password()));

        User admin = userRepo.findByEmail(request.email())
                .orElseThrow(() -> new BadRequestException("Invalid email or password"));

        if (admin.getRole() != Role.ROLE_ADMIN) {
            throw new BadRequestException("This login is only for admin accounts");
        }

        String token = jwtService.generateToken(admin);

        return new AuthResponse(
                token,
                admin.getId(),
                admin.getFullName(),
                admin.getEmail(),
                admin.getRole());
    }
}