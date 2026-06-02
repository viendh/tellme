package com.tellme.dto.response;

import com.tellme.dto.response.AttachmentResponse;
import com.tellme.entity.Issue;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class IssueResponse {

    private Long id;
    private Long projectId;
    private String projectName;
    private String projectKey;
    private Long sprintId;
    private String title;
    private String description;
    private String type;
    private String status;
    private String priority;
    private UserResponse assignee;
    private UserResponse reporter;
    private Integer position;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<CommentResponse> comments;
    private List<ActivityLogResponse> activity;
    private List<AttachmentResponse> attachments;

    private String issueKey;
    private String severity;
    private Long parentIssueId;
    private String parentIssueTitle;
    private String module;
    private String environment;
    private String businessImpact;
    private String rootCause;
    private LocalDateTime dueDate;
    private LocalDateTime startDate;
    private LocalDateTime resolutionDate;
    private Double originalEstimateHours;
    private Double remainingEstimateHours;
    private Double timeSpentHours;
    private Double progressPercent;
    private Double slaHours;

    // New fields
    private String labels;
    private Long componentId;
    private String componentName;
    private Long fixVersionId;
    private String fixVersionName;
    private Long affectsVersionId;
    private String affectsVersionName;
    private Long watchCount;
    private Long voteCount;
    private Boolean watching;   // whether current user is watching
    private Boolean voted;      // whether current user voted

    // Workflow
    private Long currentStepId;
    private String currentStepName;
    private String currentStepColor;

    // Last comment snapshot (populated when listing issues)
    private String lastCommentContent;
    private String lastCommentAuthor;
    private LocalDateTime lastCommentAt;

    public static IssueResponse fromIssue(Issue issue) {
        IssueResponse response = new IssueResponse();
        response.setId(issue.getId());
        response.setProjectId(issue.getProject().getId());
        response.setProjectName(issue.getProject().getName());
        response.setProjectKey(issue.getProject().getKey());
        response.setSprintId(issue.getSprint() != null ? issue.getSprint().getId() : null);
        response.setTitle(issue.getTitle());
        response.setDescription(issue.getDescription());
        response.setType(issue.getType().name());
        response.setStatus(issue.getStatus().name());
        response.setPriority(issue.getPriority().name());
        response.setAssignee(UserResponse.fromUser(issue.getAssignee()));
        response.setReporter(UserResponse.fromUser(issue.getReporter()));
        response.setPosition(issue.getPosition());
        response.setCreatedAt(issue.getCreatedAt());
        response.setUpdatedAt(issue.getUpdatedAt());
        response.setIssueKey(issue.getIssueKey());
        response.setSeverity(issue.getSeverity() != null ? issue.getSeverity().name() : null);
        response.setParentIssueId(issue.getParentIssue() != null ? issue.getParentIssue().getId() : null);
        response.setParentIssueTitle(issue.getParentIssue() != null ? issue.getParentIssue().getTitle() : null);
        response.setModule(issue.getModule());
        response.setEnvironment(issue.getEnvironment() != null ? issue.getEnvironment().name() : null);
        response.setBusinessImpact(issue.getBusinessImpact());
        response.setRootCause(issue.getRootCause());
        response.setDueDate(issue.getDueDate());
        response.setStartDate(issue.getStartDate());
        response.setResolutionDate(issue.getResolutionDate());
        response.setOriginalEstimateHours(issue.getOriginalEstimateHours());
        response.setRemainingEstimateHours(issue.getRemainingEstimateHours());
        response.setTimeSpentHours(issue.getTimeSpentHours());
        response.setProgressPercent(issue.getProgressPercent());
        response.setSlaHours(issue.getSlaHours());
        response.setLabels(issue.getLabels());
        if (issue.getComponent() != null) {
            response.setComponentId(issue.getComponent().getId());
            response.setComponentName(issue.getComponent().getName());
        }
        if (issue.getFixVersion() != null) {
            response.setFixVersionId(issue.getFixVersion().getId());
            response.setFixVersionName(issue.getFixVersion().getName());
        }
        if (issue.getAffectsVersion() != null) {
            response.setAffectsVersionId(issue.getAffectsVersion().getId());
            response.setAffectsVersionName(issue.getAffectsVersion().getName());
        }
        if (issue.getCurrentStep() != null) {
            response.setCurrentStepId(issue.getCurrentStep().getId());
            response.setCurrentStepName(issue.getCurrentStep().getName());
            response.setCurrentStepColor(issue.getCurrentStep().getColor());
        }
        return response;
    }
}
