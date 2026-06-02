package com.tellme.repository;

import com.tellme.entity.Project;
import com.tellme.entity.Sprint;
import com.tellme.enums.SprintStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface SprintRepository extends JpaRepository<Sprint, Long> {

    List<Sprint> findByProjectOrderByCreatedAtDesc(Project project);

    List<Sprint> findByProjectAndStatus(Project project, SprintStatus status);

    void deleteByProject(Project project);

    @Query("SELECT s FROM Sprint s WHERE s.status = 'ACTIVE' AND s.endDate IS NOT NULL AND s.endDate = :targetDate")
    List<Sprint> findActiveSprintsEndingOn(@Param("targetDate") LocalDate targetDate);

    List<Sprint> findByStatus(SprintStatus status);
}
