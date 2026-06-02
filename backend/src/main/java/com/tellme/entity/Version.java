package com.tellme.entity;

import com.tellme.enums.VersionStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import javax.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "versions",
    uniqueConstraints = @UniqueConstraint(columnNames = {"project_id", "name"}))
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Version {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private VersionStatus status = VersionStatus.UNRELEASED;

    @Column(name = "release_date")
    private LocalDate releaseDate;

    @Column(name = "start_date")
    private LocalDate startDate;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
