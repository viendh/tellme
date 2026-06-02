package com.tellme.dto.request;

import com.tellme.enums.IssueEnvironment;
import com.tellme.enums.IssuePriority;
import com.tellme.enums.IssueSeverity;
import com.tellme.enums.IssueStatus;
import com.tellme.enums.IssueType;
import lombok.Data;

import javax.validation.constraints.NotBlank;
import java.time.LocalDateTime;

@Data
public class IssueRequest {

    @NotBlank(message = "Issue title is required")
    private String title;

    private String description;

    private IssueType type;

    private IssuePriority priority;

    private IssueStatus status;

    private Long sprintId;

    private Long assigneeId;

    private Integer position;

    private IssueSeverity severity;

    private Long parentIssueId;

    private String module;

    private IssueEnvironment environment;

    private String businessImpact;

    private String rootCause;

    private LocalDateTime dueDate;

    private LocalDateTime startDate;

    private Double originalEstimateHours;

    private Double remainingEstimateHours;

    private Double timeSpentHours;

    private Double progressPercent;

    private Double slaHours;
}
