package com.tellme.dto.response;

import com.tellme.entity.Worklog;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class WorklogResponse {
    private Long id;
    private Long authorId;
    private String authorName;
    private String authorAvatar;
    private Double timeSpentHours;
    private LocalDateTime startedAt;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static WorklogResponse from(Worklog w) {
        WorklogResponse r = new WorklogResponse();
        r.setId(w.getId());
        r.setAuthorId(w.getAuthor().getId());
        r.setAuthorName(w.getAuthor().getFullName());
        r.setAuthorAvatar(w.getAuthor().getAvatarUrl());
        r.setTimeSpentHours(w.getTimeSpentHours());
        r.setStartedAt(w.getStartedAt());
        r.setDescription(w.getDescription());
        r.setCreatedAt(w.getCreatedAt());
        r.setUpdatedAt(w.getUpdatedAt());
        return r;
    }
}
