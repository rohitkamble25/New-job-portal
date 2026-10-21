package com.example.jobpotral2.service;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.jobpotral2.dto.AuthResponse;
import com.example.jobpotral2.dto.LoginRequest;
import com.example.jobpotral2.dto.RegisterRequest;
import com.example.jobpotral2.dto.UserResponse;
import com.example.jobpotral2.entity.User;
import com.example.jobpotral2.repo.UserRepo;
import com.example.jobpotral2.security.BadRequestException;
import com.example.jobpotral2.security.JwtService;
import com.example.jobpotral2.security.ResourceNotFoundException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepo userRepo;

    private final JwtService jwtService;

    private final PasswordEncoder passwordEncoder;

    private final AuthenticationManager authenticationManager;

    @Override
    public AuthResponse register(RegisterRequest request) {
        if (userRepo.existsByEmail(request.email())) {
            throw new BadRequestException(" Email Already Registered " + request.email());
        }

        User user = User.builder()
                .fullName(request.name())
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .phoneNumber(request.phoneNumber())
                .role(request.role())
                .isActive(true)
                .build();

        userRepo.save(user);
        String token = jwtService.generateToken(user);

        return new AuthResponse(token, user.getId(), user.getFullName(), user.getEmail(), user.getRole());

    }

    @Override
    public AuthResponse login(LoginRequest request) {
        authenticationManager
                .authenticate(new UsernamePasswordAuthenticationToken(request.email(), request.password()));

        User user = userRepo.findByEmail(request.email())
                .orElseThrow(() -> new ResourceNotFoundException("User Not Found"));

        String token = jwtService.generateToken(user);
        return new AuthResponse(token, user.getId(), user.getFullName(), user.getEmail(), user.getRole());
    }

    @Override
    public UserResponse getProfile(String email) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return UserResponse.from(user);
    }

}
