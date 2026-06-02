package com.tellme.dto.response;

import com.tellme.entity.WorkflowTransition;
import lombok.Data;

@Data
public class WorkflowTransitionResponse {
    private Long id;
    private Long fromStepId;
    private String fromStepName;
    private Long toStepId;
    private String toStepName;
    private String name;
    private String requiredRole;
    private Boolean requiresApproval;
    private String approverRole;

    public static WorkflowTransitionResponse from(WorkflowTransition t) {
        WorkflowTransitionResponse r = new WorkflowTransitionResponse();
        r.setId(t.getId());
        r.setFromStepId(t.getFromStep() != null ? t.getFromStep().getId() : null);
        r.setFromStepName(t.getFromStep() != null ? t.getFromStep().getName() : null);
        r.setToStepId(t.getToStep().getId());
        r.setToStepName(t.getToStep().getName());
        r.setName(t.getName());
        r.setRequiredRole(t.getRequiredRole().name());
        r.setRequiresApproval(t.getRequiresApproval());
        r.setApproverRole(t.getApproverRole() != null ? t.getApproverRole().name() : null);
        return r;
    }
}
