package com.tellme.dto.response;

import com.tellme.entity.Sprint;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class SprintResponse {

    private Long id;
    private Long projectId;
    private String name;
    private String goal;
    private String status;
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDateTime createdAt;

    public static SprintResponse fromSprint(Sprint sprint) {
        SprintResponse response = new SprintResponse();
        response.setId(sprint.getId());
        response.setProjectId(sprint.getProject().getId());
        response.setName(sprint.getName());
        response.setGoal(sprint.getGoal());
        response.setStatus(sprint.getStatus().name());
        response.setStartDate(sprint.getStartDate());
        response.setEndDate(sprint.getEndDate());
        response.setCreatedAt(sprint.getCreatedAt());
        return response;
    }
}
