package com.tellme.entity;

import com.tellme.enums.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import javax.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "projects")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String key;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<ProjectMember> members = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // ── 2.1 Thông tin cơ bản ──────────────────────────────────────────────────

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    @Builder.Default
    private ProjectStatus status = ProjectStatus.PLANNING;

    @Enumerated(EnumType.STRING)
    @Column(name = "project_type")
    @Builder.Default
    private ProjectType projectType = ProjectType.SOFTWARE;

    @Enumerated(EnumType.STRING)
    @Column(name = "visibility")
    @Builder.Default
    private ProjectVisibility visibility = ProjectVisibility.PRIVATE;

    @Enumerated(EnumType.STRING)
    @Column(name = "priority")
    private ProjectPriority priority;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "actual_end_date")
    private LocalDate actualEndDate;

    @Column(name = "progress_percent")
    private Double progressPercent;

    // ── 3. Quản lý tiến độ ────────────────────────────────────────────────────

    @Column(name = "release_version")
    private String releaseVersion;

    @Column(name = "milestone", columnDefinition = "TEXT")
    private String milestone;

    @Column(name = "velocity")
    private Double velocity;

    @Column(name = "roadmap_enabled")
    @Builder.Default
    private Boolean roadmapEnabled = false;

    @Column(name = "burndown_enabled")
    @Builder.Default
    private Boolean burndownEnabled = false;

    // ── 4. Agile / Scrum ──────────────────────────────────────────────────────

    @Enumerated(EnumType.STRING)
    @Column(name = "board_type")
    @Builder.Default
    private BoardType boardType = BoardType.SCRUM;

    @Enumerated(EnumType.STRING)
    @Column(name = "estimation_type")
    @Builder.Default
    private EstimationType estimationType = EstimationType.STORY_POINT;

    @Column(name = "sprint_duration_days")
    @Builder.Default
    private Integer sprintDurationDays = 14;

    @Column(name = "wip_limit")
    private Integer wipLimit;

    @Column(name = "backlog_enabled")
    @Builder.Default
    private Boolean backlogEnabled = true;

    // ── 5. Tài chính ──────────────────────────────────────────────────────────

    @Column(name = "budget_amount", precision = 18, scale = 2)
    private BigDecimal budgetAmount;

    @Column(name = "planned_cost", precision = 18, scale = 2)
    private BigDecimal plannedCost;

    @Column(name = "actual_cost", precision = 18, scale = 2)
    private BigDecimal actualCost;

    @Column(name = "currency_code", length = 10)
    @Builder.Default
    private String currencyCode = "VND";

    @Enumerated(EnumType.STRING)
    @Column(name = "capex_opex_type")
    private CapexOpexType capexOpexType;

    @Column(name = "contract_no")
    private String contractNo;

    // ── 6. Quản trị doanh nghiệp ──────────────────────────────────────────────

    @Enumerated(EnumType.STRING)
    @Column(name = "phase")
    private ProjectPhase phase;

    @Enumerated(EnumType.STRING)
    @Column(name = "risk_level")
    private RiskLevel riskLevel;

    @Enumerated(EnumType.STRING)
    @Column(name = "approval_status")
    @Builder.Default
    private ApprovalStatus approvalStatus = ApprovalStatus.PENDING;

    // ── 7. DevOps ─────────────────────────────────────────────────────────────

    @Column(name = "git_repository_url", columnDefinition = "TEXT")
    private String gitRepositoryUrl;

    @Column(name = "ci_pipeline_url", columnDefinition = "TEXT")
    private String ciPipelineUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "deployment_env")
    private IssueEnvironment deploymentEnv;

    @Column(name = "release_tag")
    private String releaseTag;

    @Column(name = "test_coverage")
    private Double testCoverage;

    // ── Workflow ──────────────────────────────────────────────────
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workflow_id")
    private Workflow workflow;
}
