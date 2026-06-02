package com.tellme.dto.request;

import lombok.Data;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

@Data
public class WorkflowTransitionRequest {
    /** null = từ bất kỳ bước nào */
    private Long fromStepId;

    @NotNull(message = "Target step is required")
    private Long toStepId;

    @NotBlank(message = "Transition name is required")
    @Size(max = 100)
    private String name;

    /** ANY | ASSIGNEE | REPORTER | MANAGER | ADMIN */
    private String requiredRole;

    private Boolean requiresApproval;

    /** REPORTER | MANAGER | ADMIN — required when requiresApproval = true */
    private String approverRole;
}
