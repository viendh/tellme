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
@Table(name = "saved_filters")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SavedFilter {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creator_id", nullable = false)
    private User creator;

    @Column(nullable = false, length = 200)
    private String name;

    /** JSON string lưu các tiêu chí lọc */
    @Column(name = "filter_criteria", columnDefinition = "TEXT")
    private String filterCriteria;

    /** Có chia sẻ cho tất cả mọi người không */
    @Column(name = "is_shared")
    @Builder.Default
    private Boolean isShared = false;

    @Column(name = "is_favorite")
    @Builder.Default
    private Boolean isFavorite = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
