package com.tellme.dto.request;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class WorklogRequest {
    private Double timeSpentHours;
    private LocalDateTime startedAt;
    private String description;
}
