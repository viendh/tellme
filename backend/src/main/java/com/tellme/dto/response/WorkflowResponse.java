package com.tellme.dto.response;

import com.tellme.entity.Workflow;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
public class WorkflowResponse {
    private Long id;
    private String name;
    private String description;
    private Boolean isDefault;
    private String createdBy;
    private LocalDateTime createdAt;
    private List<WorkflowStepResponse> steps;
    private List<WorkflowTransitionResponse> transitions;

    public static WorkflowResponse from(Workflow w) {
        WorkflowResponse r = new WorkflowResponse();
        r.setId(w.getId());
        r.setName(w.getName());
        r.setDescription(w.getDescription());
        r.setIsDefault(w.getIsDefault());
        r.setCreatedBy(w.getCreatedBy() != null ? w.getCreatedBy().getFullName() : null);
        r.setCreatedAt(w.getCreatedAt());
        r.setSteps(w.getSteps().stream()
                .map(WorkflowStepResponse::from).collect(Collectors.toList()));
        r.setTransitions(w.getTransitions().stream()
                .map(WorkflowTransitionResponse::from).collect(Collectors.toList()));
        return r;
    }
}
