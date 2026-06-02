package com.tellme.controller;

import com.tellme.dto.request.UpdateUserRoleRequest;
import com.tellme.dto.request.UpdateUserStatusRequest;
import com.tellme.dto.response.EmailLogResponse;
import com.tellme.dto.response.UserResponse;
import com.tellme.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @GetMapping("/users")
    public ResponseEntity<List<UserResponse>> getAllUsers(
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(adminService.getAllUsers(search));
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.getUserById(id));
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<UserResponse> updateRole(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRoleRequest request) {
        return ResponseEntity.ok(adminService.updateUserRole(id, request));
    }

    @PutMapping("/users/{id}/status")
    public ResponseEntity<UserResponse> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserStatusRequest request) {
        return ResponseEntity.ok(adminService.updateUserStatus(id, request));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        adminService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/users/pending")
    public ResponseEntity<List<UserResponse>> getPendingUsers() {
        return ResponseEntity.ok(adminService.getPendingUsers());
    }

    @PutMapping("/users/{id}/approve")
    public ResponseEntity<UserResponse> approveUser(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.approveUser(id));
    }

    @PutMapping("/users/{id}/reject")
    public ResponseEntity<UserResponse> rejectUser(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.rejectUser(id));
    }

    // ── Email Log Management ──────────────────────────────────────────────────

    @GetMapping("/email-logs")
    public ResponseEntity<List<EmailLogResponse>> getEmailLogs(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String emailType,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(adminService.getEmailLogs(status, emailType, search));
    }

    @DeleteMapping("/email-logs/{id}")
    public ResponseEntity<Void> deleteEmailLog(@PathVariable Long id) {
        adminService.deleteEmailLog(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/email-logs")
    public ResponseEntity<Void> clearEmailLogs() {
        adminService.clearEmailLogs();
        return ResponseEntity.noContent().build();
    }
}
