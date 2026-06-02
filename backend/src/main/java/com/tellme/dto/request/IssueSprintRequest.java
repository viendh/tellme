package com.tellme.dto.request;

import lombok.Data;

@Data
public class IssueSprintRequest {

    // nullable - null means move to backlog
    private Long sprintId;
}
