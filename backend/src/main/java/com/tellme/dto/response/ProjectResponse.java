package com.tellme.dto.response;

import com.tellme.entity.Project;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
public class ProjectResponse {

    private Long id;
    private String name;
    private String key;
    private String description;
    private UserResponse owner;
    private List<MemberResponse> members;
    private LocalDateTime createdAt;

    // ── 2.1 Cơ bản ────────────────────────────────────────────────────────────
    private String status;
    private String projectType;
    private String visibility;
    private String priority;
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDate actualEndDate;
    private Double progressPercent;

    // ── 3. Tiến độ ────────────────────────────────────────────────────────────
    private String releaseVersion;
    private String milestone;
    private Double velocity;
    private Boolean roadmapEnabled;
    private Boolean burndownEnabled;

    // ── 4. Agile ──────────────────────────────────────────────────────────────
    private String boardType;
    private String estimationType;
    private Integer sprintDurationDays;
    private Integer wipLimit;
    private Boolean backlogEnabled;

    // ── 5. Tài chính ──────────────────────────────────────────────────────────
    private BigDecimal budgetAmount;
    private BigDecimal plannedCost;
    private BigDecimal actualCost;
    private String currencyCode;
    private String capexOpexType;
    private String contractNo;

    // ── 6. Quản trị ───────────────────────────────────────────────────────────
    private String phase;
    private String riskLevel;
    private String approvalStatus;

    // ── 7. DevOps ─────────────────────────────────────────────────────────────
    private String gitRepositoryUrl;
    private String ciPipelineUrl;
    private String deploymentEnv;
    private String releaseTag;
    private Double testCoverage;

    // ── 8. Workflow ───────────────────────────────────────────────────────────
    private Long workflowId;
    private String workflowName;

    @Data
    public static class MemberResponse {
        private Long id;
        private UserResponse user;
        private String role;
    }

    public static ProjectResponse fromProject(Project project) {
        ProjectResponse r = new ProjectResponse();
        r.setId(project.getId());
        r.setName(project.getName());
        r.setKey(project.getKey());
        r.setDescription(project.getDescription());
        r.setOwner(UserResponse.fromUser(project.getOwner()));
        r.setCreatedAt(project.getCreatedAt());

        // Basic
        r.setStatus(project.getStatus() != null ? project.getStatus().name() : "PLANNING");
        r.setProjectType(project.getProjectType() != null ? project.getProjectType().name() : null);
        r.setVisibility(project.getVisibility() != null ? project.getVisibility().name() : null);
        r.setPriority(project.getPriority() != null ? project.getPriority().name() : null);
        r.setStartDate(project.getStartDate());
        r.setEndDate(project.getEndDate());
        r.setActualEndDate(project.getActualEndDate());
        r.setProgressPercent(project.getProgressPercent());

        // Progress
        r.setReleaseVersion(project.getReleaseVersion());
        r.setMilestone(project.getMilestone());
        r.setVelocity(project.getVelocity());
        r.setRoadmapEnabled(project.getRoadmapEnabled());
        r.setBurndownEnabled(project.getBurndownEnabled());

        // Agile
        r.setBoardType(project.getBoardType() != null ? project.getBoardType().name() : null);
        r.setEstimationType(project.getEstimationType() != null ? project.getEstimationType().name() : null);
        r.setSprintDurationDays(project.getSprintDurationDays());
        r.setWipLimit(project.getWipLimit());
        r.setBacklogEnabled(project.getBacklogEnabled());

        // Financial
        r.setBudgetAmount(project.getBudgetAmount());
        r.setPlannedCost(project.getPlannedCost());
        r.setActualCost(project.getActualCost());
        r.setCurrencyCode(project.getCurrencyCode());
        r.setCapexOpexType(project.getCapexOpexType() != null ? project.getCapexOpexType().name() : null);
        r.setContractNo(project.getContractNo());

        // Governance
        r.setPhase(project.getPhase() != null ? project.getPhase().name() : null);
        r.setRiskLevel(project.getRiskLevel() != null ? project.getRiskLevel().name() : null);
        r.setApprovalStatus(project.getApprovalStatus() != null ? project.getApprovalStatus().name() : null);

        // DevOps
        r.setGitRepositoryUrl(project.getGitRepositoryUrl());
        r.setCiPipelineUrl(project.getCiPipelineUrl());
        r.setDeploymentEnv(project.getDeploymentEnv() != null ? project.getDeploymentEnv().name() : null);
        r.setReleaseTag(project.getReleaseTag());
        r.setTestCoverage(project.getTestCoverage());

        // Workflow
        if (project.getWorkflow() != null) {
            r.setWorkflowId(project.getWorkflow().getId());
            r.setWorkflowName(project.getWorkflow().getName());
        }

        if (project.getMembers() != null) {
            r.setMembers(project.getMembers().stream().map(m -> {
                MemberResponse mr = new MemberResponse();
                mr.setId(m.getId());
                mr.setUser(UserResponse.fromUser(m.getUser()));
                mr.setRole(m.getRole().name());
                return mr;
            }).collect(Collectors.toList()));
        }

        return r;
    }
}
