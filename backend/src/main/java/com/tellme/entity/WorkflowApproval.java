package com.tellme.entity;

import com.tellme.enums.WorkflowApprovalStatus;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "workflow_approvals")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowApproval {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "issue_id", nullable = false)
    private Issue issue;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "transition_id", nullable = false)
    private WorkflowTransition transition;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requested_by", nullable = false)
    private User requestedBy;

    /** Snapshot tên bước xuất phát tại thời điểm tạo yêu cầu */
    @Column(name = "from_step_name", length = 100)
    private String fromStepName;

    /** Snapshot tên bước đích tại thời điểm tạo yêu cầu */
    @Column(name = "to_step_name", nullable = false, length = 100)
    private String toStepName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private WorkflowApprovalStatus status = WorkflowApprovalStatus.PENDING;

    /** Ghi chú khi phê duyệt hoặc lý do từ chối */
    @Column(columnDefinition = "TEXT")
    private String comment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resolved_by")
    private User resolvedBy;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
