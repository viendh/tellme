package com.tellme.dto.request;

import lombok.Data;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

@Data
public class WorkflowStepRequest {
    @NotBlank(message = "Step name is required")
    @Size(max = 100)
    private String name;

    @Size(max = 20)
    private String color;

    private Integer position;
    private Boolean isInitial;
    private Boolean isFinal;

    /** Tên IssueStatus enum tương ứng (vd: "TODO", "IN_PROGRESS", "DONE") */
    @Size(max = 30)
    private String mappedStatus;
}
