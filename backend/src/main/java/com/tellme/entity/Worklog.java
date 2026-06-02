package com.tellme.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "worklogs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Worklog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "issue_id", nullable = false)
    private Issue issue;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    /** Số giờ ghi nhận (ví dụ: 1.5 = 1h30m) */
    @Column(name = "time_spent_hours", nullable = false)
    private Double timeSpentHours;

    /** Thời điểm bắt đầu làm việc */
    @Column(name = "started_at")
    private LocalDateTime startedAt;

    /** Ghi chú/diễn giải công việc đã làm */
    @Column(columnDefinition = "TEXT")
    private String description;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
