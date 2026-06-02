package com.tellme.entity;

import com.tellme.enums.TransitionRole;
import lombok.*;

import javax.persistence.*;

@Entity
@Table(name = "workflow_transitions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowTransition {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workflow_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Workflow workflow;

    /** Bước xuất phát (null = từ BẤT KỲ bước nào) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "from_step_id")
    private WorkflowStep fromStep;

    /** Bước đích */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "to_step_id", nullable = false)
    private WorkflowStep toStep;

    /** Nhãn nút bấm (vd: "Bắt đầu", "Gửi phê duyệt", "Phê duyệt", "Từ chối") */
    @Column(nullable = false, length = 100)
    private String name;

    /** Ai được phép kích hoạt transition này */
    @Enumerated(EnumType.STRING)
    @Column(name = "required_role", nullable = false, length = 20)
    @Builder.Default
    private TransitionRole requiredRole = TransitionRole.ANY;

    /** Transition này có cần phê duyệt trước khi thực sự đổi trạng thái không? */
    @Column(name = "requires_approval", nullable = false, columnDefinition = "BOOLEAN DEFAULT FALSE")
    @Builder.Default
    private Boolean requiresApproval = false;

    /**
     * Role phê duyệt khi requiresApproval = true.
     * Dùng TransitionRole: REPORTER, MANAGER, ADMIN
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "approver_role", length = 20)
    private TransitionRole approverRole;
}
