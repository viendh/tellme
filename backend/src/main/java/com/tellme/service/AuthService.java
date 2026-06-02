package com.tellme.service;

import com.tellme.dto.request.ChangePasswordRequest;
import com.tellme.dto.request.LoginRequest;
import com.tellme.dto.request.NotificationSettingsRequest;
import com.tellme.dto.request.RegisterRequest;
import com.tellme.dto.request.UpdateProfileRequest;
import com.tellme.dto.response.AuthResponse;
import com.tellme.dto.response.UserResponse;
import com.tellme.entity.User;
import com.tellme.enums.UserRole;
import com.tellme.repository.UserRepository;
import com.tellme.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email is already in use");
        }

        long userCount = userRepository.count();
        boolean isFirstUser = (userCount == 0);
        UserRole role = isFirstUser ? UserRole.ADMIN : UserRole.USER;

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .role(role)
                .isActive(true)
                .isApproved(isFirstUser) // first user (admin) auto-approved
                .build();

        user = userRepository.save(user);

        String token = tokenProvider.generateTokenFromEmail(user.getEmail());
        return new AuthResponse(token, UserResponse.fromUser(user));
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        User existingUser = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!Boolean.TRUE.equals(existingUser.getIsApproved())) {
            throw new RuntimeException("ACCOUNT_PENDING_APPROVAL");
        }
        if (!Boolean.TRUE.equals(existingUser.getIsActive())) {
            throw new RuntimeException("Account has been deactivated");
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String token = tokenProvider.generateToken(authentication);

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return new AuthResponse(token, UserResponse.fromUser(user));
    }

    @Transactional(readOnly = true)
    public UserResponse getCurrentUser() {
        return UserResponse.fromUser(getCurrentUserEntity());
    }

    @Transactional(readOnly = true)
    public User getCurrentUserEntity() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserDetails)) {
            throw new RuntimeException("Not authenticated");
        }
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Transactional
    public UserResponse updateProfile(UpdateProfileRequest request) {
        User user = getCurrentUserEntity();
        user.setFullName(request.getFullName());
        if (request.getAvatarUrl() != null) {
            user.setAvatarUrl(request.getAvatarUrl().trim().isEmpty() ? null : request.getAvatarUrl());
        }
        return UserResponse.fromUser(userRepository.save(user));
    }

    @Transactional
    public void changePassword(ChangePasswordRequest request) {
        User user = getCurrentUserEntity();
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadCredentialsException("Current password is incorrect");
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    @Transactional
    public UserResponse updateNotifications(NotificationSettingsRequest request) {
        User user = getCurrentUserEntity();
        if (request.getNotifyOnAssigned() != null)     user.setNotifyOnAssigned(request.getNotifyOnAssigned());
        if (request.getNotifyOnStatusChange() != null) user.setNotifyOnStatusChange(request.getNotifyOnStatusChange());
        if (request.getNotifyOnComment() != null)      user.setNotifyOnComment(request.getNotifyOnComment());
        return UserResponse.fromUser(userRepository.save(user));
    }
}
