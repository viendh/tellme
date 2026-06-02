package com.tellme.controller;

import com.tellme.dto.request.ChangePasswordRequest;
import com.tellme.dto.request.LoginRequest;
import com.tellme.dto.request.NotificationSettingsRequest;
import com.tellme.dto.request.RegisterRequest;
import com.tellme.dto.request.UpdateProfileRequest;
import com.tellme.dto.response.AuthResponse;
import com.tellme.dto.response.UserResponse;
import com.tellme.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.Collections;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser() {
        return ResponseEntity.ok(authService.getCurrentUser());
    }

    /** Cập nhật họ tên và avatar */
    @PutMapping("/profile")
    public ResponseEntity<UserResponse> updateProfile(@Valid @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(authService.updateProfile(request));
    }

    /** Đổi mật khẩu */
    @PutMapping("/password")
    public ResponseEntity<?> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        authService.changePassword(request);
        return ResponseEntity.ok(Collections.singletonMap("message", "Password changed successfully"));
    }

    /** Cập nhật tuỳ chọn thông báo email */
    @PutMapping("/notifications")
    public ResponseEntity<UserResponse> updateNotifications(@RequestBody NotificationSettingsRequest request) {
        return ResponseEntity.ok(authService.updateNotifications(request));
    }
}
