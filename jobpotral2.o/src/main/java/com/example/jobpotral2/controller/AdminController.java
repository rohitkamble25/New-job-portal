package com.example.jobpotral2.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.jobpotral2.dto.AdminRegisterRequest;
import com.example.jobpotral2.dto.ApiResponse;
import com.example.jobpotral2.dto.AuthResponse;
import com.example.jobpotral2.dto.CompanyResponse;
import com.example.jobpotral2.dto.LoginRequest;
import com.example.jobpotral2.dto.UserResponse;
import com.example.jobpotral2.service.AdminAuthService;
import com.example.jobpotral2.service.CompanyService;
import com.example.jobpotral2.service.UserService;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Tag(name = "Admin", description = "Admin-only management APIs")
public class AdminController {

    private final UserService userService;
    private final CompanyService companyService;
    private final AdminAuthService adminAuthService;

    @PostMapping("/register")
    @Operation(summary = "Register the first admin during initial setup")
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @Valid @RequestBody AdminRegisterRequest request) {

        AuthResponse response = adminAuthService.registerFirstAdmin(request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Admin registered successfully", response));
    }

    @PostMapping("/login")
    @Operation(summary = "Login as admin")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request) {

        AuthResponse response = adminAuthService.login(request);

        return ResponseEntity.ok(
                ApiResponse.success("Admin login successful", response));
    }

    @PatchMapping("/companies/{id}/approve")
    @Operation(summary = "Approve a pending company", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ApiResponse<CompanyResponse>> approveCompany(@PathVariable Long id) {
        CompanyResponse company = companyService.approveCompany(id);
        return ResponseEntity.ok(ApiResponse.success("Company approved successfully", company));
    }

    @GetMapping("/companies")
@Operation(
    summary = "Get all companies",
    security = @SecurityRequirement(name = "bearerAuth")
)
public ResponseEntity<ApiResponse<List<CompanyResponse>>> getAllCompanies() {
    return ResponseEntity.ok(
        ApiResponse.success(
            "All companies fetched successfully",
            companyService.getAllCompanies()
        )
    );
}

    @GetMapping("/users")
    @Operation(summary = "Get all registered users", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers() {
        return ResponseEntity.ok(ApiResponse.success("All users fetched", userService.getAllUsers()));
    }

    @GetMapping("/users/{id}")
    @Operation(summary = "Get a single user by ID", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("User fetched", userService.getUserById(id)));
    }

    @PatchMapping("/users/{id}/toggle")
    @Operation(summary = "Activate or deactivate a user", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ApiResponse<Void>> toggleUserStatus(@PathVariable Long id) {
        userService.toggleUserStatus(id);
        return ResponseEntity.ok(ApiResponse.success("User status toggled successfully"));
    }
}