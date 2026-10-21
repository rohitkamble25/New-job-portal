package com.example.jobpotral2.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.UrlResource;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.jobpotral2.dto.ApiResponse;
import com.example.jobpotral2.dto.UpdateProfileRequest;
import com.example.jobpotral2.dto.UserResponse;
import com.example.jobpotral2.service.UserService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "profile", description = "User profile and resume management")
public class ProfileController {
    private final UserService userService;

    @Value("${app.upload.dir}")
    private String uploadDir;

    @PutMapping
    @Operation(summary = "Update user profile", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ApiResponse<UserResponse>> updateProfile(@RequestBody UpdateProfileRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success("Profile updated",
                userService.updateProfile(request, userDetails.getUsername())));
    }

    @PostMapping("/resume")
    @Operation(summary = "Upload resume PDF", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ApiResponse<UserResponse>> uploadResume(@RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserDetails userDetails) throws IOException {

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("File is empty"));
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.equals("application/pdf")) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Only PDF files are allowed"));
        }

        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path filePath = uploadPath.resolve(filename);
        Files.copy(file.getInputStream(), filePath);

        String resumeUrl = "/uploads/resumes/" + filename;
        UserResponse updated = userService.updateResumeUrl(resumeUrl, userDetails.getUsername());

        return ResponseEntity.ok(ApiResponse.success("Resume uploaded successfully", updated));

    }
    @GetMapping("/resume/view/{filename:.+}")
public ResponseEntity<Resource> viewResume(
        @PathVariable String filename) throws IOException {

    Path path = Paths.get(uploadDir).resolve(filename).normalize();

    if (!Files.exists(path) || !Files.isRegularFile(path)) {
        return ResponseEntity.notFound().build();
    }

    Resource resource = new UrlResource(path.toUri());

    return ResponseEntity.ok()
            .contentType(MediaType.APPLICATION_PDF)
            .header(
                    HttpHeaders.CONTENT_DISPOSITION,
                    "inline; filename=\"" + resource.getFilename() + "\""
            )
            .body(resource);
}
}
