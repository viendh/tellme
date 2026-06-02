package com.tellme.repository;

import com.tellme.entity.Project;
import com.tellme.entity.Sprint;
import com.tellme.enums.SprintStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SprintRepository extends JpaRepository<Sprint, Long> {

    List<Sprint> findByProjectOrderByCreatedAtDesc(Project project);

    List<Sprint> findByProjectAndStatus(Project project, SprintStatus status);

    void deleteByProject(Project project);
}
