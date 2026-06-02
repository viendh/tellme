package com.tellme.dto.request;

import com.tellme.enums.*;
import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Pattern;
import javax.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
public class ProjectRequest {

    @NotBlank(message = "Project name is required")
    private String name;

    @NotBlank(message = "Project key is required")
    @Size(min = 2, max = 10, message = "Project key must be between 2 and 10 characters")
    @Pattern(regexp = "^[A-Z0-9]+$", message = "Project key must contain only uppercase letters and numbers")
    private String key;

    private String description;

    private List<AddMemberRequest> members;

    // ── 2.1 Cơ bản ────────────────────────────────────────────────────────────
    private ProjectStatus status;
    private ProjectType projectType;
    private ProjectVisibility visibility;
    private ProjectPriority priority;
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
    private BoardType boardType;
    private EstimationType estimationType;
    private Integer sprintDurationDays;
    private Integer wipLimit;
    private Boolean backlogEnabled;

    // ── 5. Tài chính ──────────────────────────────────────────────────────────
    private BigDecimal budgetAmount;
    private BigDecimal plannedCost;
    private BigDecimal actualCost;
    private String currencyCode;
    private CapexOpexType capexOpexType;
    private String contractNo;

    // ── 6. Quản trị ───────────────────────────────────────────────────────────
    private ProjectPhase phase;
    private RiskLevel riskLevel;
    private ApprovalStatus approvalStatus;

    // ── 7. DevOps ─────────────────────────────────────────────────────────────
    private String gitRepositoryUrl;
    private String ciPipelineUrl;
    private IssueEnvironment deploymentEnv;
    private String releaseTag;
    private Double testCoverage;
}
