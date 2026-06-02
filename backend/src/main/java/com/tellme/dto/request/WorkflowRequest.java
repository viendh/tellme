package com.tellme.dto.request;

import lombok.Data;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

@Data
public class WorkflowRequest {
    @NotBlank(message = "Workflow name is required")
    @Size(max = 100)
    private String name;

    private String description;
    private Boolean isDefault;
}
