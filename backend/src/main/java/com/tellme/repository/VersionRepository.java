package com.tellme.repository;

import com.tellme.entity.Project;
import com.tellme.entity.Version;
import com.tellme.enums.VersionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VersionRepository extends JpaRepository<Version, Long> {
    List<Version> findByProjectOrderByCreatedAtDesc(Project project);
    List<Version> findByProjectAndStatusOrderByReleaseDateAsc(Project project, VersionStatus status);
    Optional<Version> findByProjectAndName(Project project, String name);
    boolean existsByProjectAndName(Project project, String name);
}
