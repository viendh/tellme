package com.tellme.entity;

import com.tellme.enums.IssueEnvironment;
import com.tellme.enums.IssuePriority;
import com.tellme.enums.IssueSeverity;
import com.tellme.enums.IssueStatus;
import com.tellme.enums.IssueType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "issues")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Issue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sprint_id")
    private Sprint sprint;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private IssueType type = IssueType.TASK;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private IssueStatus status = IssueStatus.TODO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private IssuePriority priority = IssuePriority.MEDIUM;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignee_id")
    private User assignee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reporter_id", nullable = false)
    private User reporter;

    @Column(name = "position")
    @Builder.Default
    private Integer position = 0;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Issue key like TM-1, ERP-101
    @Column(name = "issue_key", length = 50)
    private String issueKey;

    // Severity
    @Enumerated(EnumType.STRING)
    @Column(name = "severity", columnDefinition = "VARCHAR(30) DEFAULT 'MINOR'")
    private IssueSeverity severity;

    // Parent issue (for subtasks)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_issue_id")
    private Issue parentIssue;

    // Module (AP/AR/GL/INV or custom)
    @Column(name = "module", length = 100)
    private String module;

    // Environment
    @Enumerated(EnumType.STRING)
    @Column(name = "environment", columnDefinition = "VARCHAR(30)")
    private IssueEnvironment environment;

    // Business impact
    @Column(name = "business_impact", columnDefinition = "TEXT")
    private String businessImpact;

    // Root cause
    @Column(name = "root_cause", columnDefinition = "TEXT")
    private String rootCause;

    // Dates
    @Column(name = "due_date")
    private LocalDateTime dueDate;

    @Column(name = "start_date")
    private LocalDateTime startDate;

    @Column(name = "resolution_date")
    private LocalDateTime resolutionDate;

    // Time tracking (hours)
    @Column(name = "original_estimate_hours")
    private Double originalEstimateHours;

    @Column(name = "remaining_estimate_hours")
    private Double remainingEstimateHours;

    @Column(name = "time_spent_hours", columnDefinition = "DOUBLE PRECISION DEFAULT 0")
    @Builder.Default
    private Double timeSpentHours = 0.0;

    // Progress
    @Column(name = "progress_percent", columnDefinition = "NUMERIC(5,2) DEFAULT 0")
    @Builder.Default
    private Double progressPercent = 0.0;

    // SLA
    @Column(name = "sla_hours")
    private Double slaHours;

    // Labels (comma-separated free-text tags)
    @Column(name = "labels", columnDefinition = "TEXT")
    private String labels;

    // Component
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "component_id")
    private Component component;

    // Fix version (version dự kiến fix)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fix_version_id")
    private Version fixVersion;

    // Affects version (version bị ảnh hưởng)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "affects_version_id")
    private Version affectsVersion;

    // ── Workflow ─────────────────────────────────────────────────
    /** Bước workflow hiện tại. Null = chưa áp dụng workflow */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "current_step_id")
    private WorkflowStep currentStep;
}
