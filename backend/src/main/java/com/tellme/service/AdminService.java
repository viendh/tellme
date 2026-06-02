package com.tellme.service;

import com.tellme.dto.request.UpdateUserRoleRequest;
import com.tellme.dto.request.UpdateUserStatusRequest;
import com.tellme.dto.response.EmailLogResponse;
import com.tellme.dto.response.UserResponse;
import com.tellme.entity.User;
import com.tellme.enums.EmailStatus;
import com.tellme.enums.EmailType;
import com.tellme.repository.EmailLogRepository;
import com.tellme.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class AdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailLogRepository emailLogRepository;

    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers(String search) {
        List<User> users;
        if (search != null && !search.trim().isEmpty()) {
            users = userRepository.findByFullNameContainingIgnoreCaseOrEmailContainingIgnoreCase(
                    search.trim(), search.trim());
        } else {
            users = userRepository.findAllByOrderByCreatedAtDesc();
        }
        return users.stream().map(UserResponse::fromUser).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new RuntimeException("User not found"));
        return UserResponse.fromUser(user);
    }

    @Transactional
    public UserResponse updateUserRole(Long id, UpdateUserRoleRequest request) {
        User user = userRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setRole(request.getRole());
        return UserResponse.fromUser(userRepository.save(Objects.requireNonNull(user)));
    }

    @Transactional
    public UserResponse updateUserStatus(Long id, UpdateUserStatusRequest request) {
        User user = userRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setIsActive(request.getIsActive());
        return UserResponse.fromUser(userRepository.save(Objects.requireNonNull(user)));
    }

    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new RuntimeException("User not found"));
        userRepository.delete(Objects.requireNonNull(user));
    }

    @Transactional(readOnly = true)
    public List<UserResponse> getPendingUsers() {
        return userRepository.findByIsApprovedFalseOrderByCreatedAtDesc()
                .stream().map(UserResponse::fromUser).collect(Collectors.toList());
    }

    @Transactional
    public UserResponse approveUser(Long id) {
        User user = userRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setIsApproved(true);
        user.setIsActive(true);
        return UserResponse.fromUser(userRepository.save(Objects.requireNonNull(user)));
    }

    @Transactional
    public UserResponse rejectUser(Long id) {
        User user = userRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setIsApproved(false);
        user.setIsActive(false);
        return UserResponse.fromUser(userRepository.save(Objects.requireNonNull(user)));
    }

    // ── Email Log Management ──────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<EmailLogResponse> getEmailLogs(String status, String emailType, String search) {
        EmailStatus statusEnum = (status != null && !status.isEmpty())
                ? EmailStatus.valueOf(status) : null;
        EmailType typeEnum = (emailType != null && !emailType.isEmpty())
                ? EmailType.valueOf(emailType) : null;
        String searchParam = (search != null && !search.trim().isEmpty()) ? search.trim() : null;

        return emailLogRepository.findWithFilters(statusEnum, typeEnum, searchParam)
                .stream()
                .map(EmailLogResponse::fromEmailLog)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteEmailLog(Long id) {
        emailLogRepository.deleteById(Objects.requireNonNull(id));
    }

    @Transactional
    public void clearEmailLogs() {
        emailLogRepository.deleteAll();
    }
}
