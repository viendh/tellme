package com.tellme.dto.request;

import com.tellme.enums.IssueStatus;
import lombok.Data;

import javax.validation.constraints.NotNull;

@Data
public class IssueStatusRequest {

    @NotNull(message = "Status is required")
    private IssueStatus status;

    private Integer position;
}
