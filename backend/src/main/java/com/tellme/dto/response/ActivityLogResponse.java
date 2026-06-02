package com.tellme.dto.response;

import com.tellme.entity.ActivityLog;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ActivityLogResponse {

    private Long id;
    private Long issueId;
    private UserResponse user;
    private String action;
    private String fieldName;
    private String oldValue;
    private String newValue;
    private LocalDateTime createdAt;

    public static ActivityLogResponse fromActivityLog(ActivityLog log) {
        ActivityLogResponse response = new ActivityLogResponse();
        response.setId(log.getId());
        response.setIssueId(log.getIssue().getId());
        response.setUser(UserResponse.fromUser(log.getUser()));
        response.setAction(log.getAction());
        response.setFieldName(log.getFieldName());
        response.setOldValue(log.getOldValue());
        response.setNewValue(log.getNewValue());
        response.setCreatedAt(log.getCreatedAt());
        return response;
    }
}
