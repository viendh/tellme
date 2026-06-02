package com.tellme.dto.response;

import com.tellme.entity.WorkflowApproval;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class WorkflowApprovalResponse {
    private Long id;
    private Long issueId;
    private String issueKey;
    private String issueTitle;
    private Long projectId;
    private String projectName;
    private Long transitionId;
    private String transitionName;
    private String fromStepName;
    private String toStepName;
    private String status;           // PENDING | APPROVED | REJECTED
    private String comment;
    private UserResponse requestedBy;
    private UserResponse resolvedBy;
    private LocalDateTime resolvedAt;
    private LocalDateTime createdAt;

    public static WorkflowApprovalResponse from(WorkflowApproval a) {
        WorkflowApprovalResponse r = new WorkflowApprovalResponse();
        r.setId(a.getId());
        r.setIssueId(a.getIssue().getId());
        r.setIssueKey(a.getIssue().getIssueKey());
        r.setIssueTitle(a.getIssue().getTitle());
        r.setProjectId(a.getIssue().getProject().getId());
        r.setProjectName(a.getIssue().getProject().getName());
        r.setTransitionId(a.getTransition().getId());
        r.setTransitionName(a.getTransition().getName());
        r.setFromStepName(a.getFromStepName());
        r.setToStepName(a.getToStepName());
        r.setStatus(a.getStatus().name());
        r.setComment(a.getComment());
        r.setRequestedBy(UserResponse.fromUser(a.getRequestedBy()));
        r.setResolvedBy(UserResponse.fromUser(a.getResolvedBy()));
        r.setResolvedAt(a.getResolvedAt());
        r.setCreatedAt(a.getCreatedAt());
        return r;
    }
}
