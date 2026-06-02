package com.tellme.dto.response;

import com.tellme.entity.User;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UserResponse {

    private Long id;
    private String email;
    private String fullName;
    private String avatarUrl;
    private LocalDateTime createdAt;
    private String role;
    private Boolean isActive;
    private Boolean isApproved;
    private Boolean notifyOnAssigned;
    private Boolean notifyOnStatusChange;
    private Boolean notifyOnComment;

    public static UserResponse fromUser(User user) {
        if (user == null) return null;
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setEmail(user.getEmail());
        response.setFullName(user.getFullName());
        response.setAvatarUrl(user.getAvatarUrl());
        response.setCreatedAt(user.getCreatedAt());
        response.setRole(user.getRole() != null ? user.getRole().name() : "USER");
        response.setIsActive(user.getIsActive() != null ? user.getIsActive() : true);
        response.setIsApproved(user.getIsApproved() != null ? user.getIsApproved() : false);
        response.setNotifyOnAssigned(user.getNotifyOnAssigned() != null ? user.getNotifyOnAssigned() : true);
        response.setNotifyOnStatusChange(user.getNotifyOnStatusChange() != null ? user.getNotifyOnStatusChange() : true);
        response.setNotifyOnComment(user.getNotifyOnComment() != null ? user.getNotifyOnComment() : true);
        return response;
    }
}
