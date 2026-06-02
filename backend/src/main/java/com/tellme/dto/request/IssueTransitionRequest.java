package com.tellme.dto.request;

import lombok.Data;
import javax.validation.constraints.NotNull;

@Data
public class IssueTransitionRequest {
    @NotNull(message = "Transition ID is required")
    private Long transitionId;

    /** Ghi chú kèm theo khi thực hiện transition */
    private String comment;
}
