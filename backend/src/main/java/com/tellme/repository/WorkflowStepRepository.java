package com.tellme.repository;

import com.tellme.entity.Workflow;
import com.tellme.entity.WorkflowStep;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WorkflowStepRepository extends JpaRepository<WorkflowStep, Long> {
    List<WorkflowStep> findByWorkflowOrderByPositionAsc(Workflow workflow);
}
