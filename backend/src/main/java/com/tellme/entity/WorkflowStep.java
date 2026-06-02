package com.tellme.entity;

import lombok.*;

import javax.persistence.*;

@Entity
@Table(name = "workflow_steps")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowStep {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workflow_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Workflow workflow;

    /** Tên hiển thị của bước (vd: "Chờ xử lý", "Đang làm", "Chờ phê duyệt") */
    @Column(nullable = false, length = 100)
    private String name;

    /** Màu badge (hex, vd: "#3b82f6") */
    @Column(length = 20)
    @Builder.Default
    private String color = "#6b7280";

    /** Thứ tự hiển thị */
    @Column(nullable = false)
    @Builder.Default
    private Integer position = 0;

    /** Bước khởi đầu (issue mới được gán bước này) */
    @Column(name = "is_initial", nullable = false, columnDefinition = "BOOLEAN DEFAULT FALSE")
    @Builder.Default
    private Boolean isInitial = false;

    /** Bước kết thúc (done) */
    @Column(name = "is_final", nullable = false, columnDefinition = "BOOLEAN DEFAULT FALSE")
    @Builder.Default
    private Boolean isFinal = false;

    /**
     * Map về IssueStatus enum để tương thích với các query hiện tại.
     * VD: "DONE", "IN_PROGRESS", "TODO" …
     * Nullable — nếu null, issue vẫn giữ nguyên status enum hiện tại khi chuyển sang bước này.
     */
    @Column(name = "mapped_status", length = 30)
    private String mappedStatus;
}
