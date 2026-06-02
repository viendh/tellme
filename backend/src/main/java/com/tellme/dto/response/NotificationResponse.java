package com.tellme.dto.response;

import com.tellme.entity.Notification;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class NotificationResponse {

    private Long id;
    private String type;
    private String title;
    private String body;
    private Long issueId;
    private String issueKey;
    private String projectName;
    private Boolean read;
    private LocalDateTime createdAt;

    public static NotificationResponse from(Notification n) {
        NotificationResponse r = new NotificationResponse();
        r.setId(n.getId());
        r.setType(n.getType());
        r.setTitle(n.getTitle());
        r.setBody(n.getBody());
        r.setIssueId(n.getIssueId());
        r.setIssueKey(n.getIssueKey());
        r.setProjectName(n.getProjectName());
        r.setRead(n.getRead());
        r.setCreatedAt(n.getCreatedAt());
        return r;
    }
}
