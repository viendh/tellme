package com.tellme.repository;

import com.tellme.entity.Workflow;
import com.tellme.entity.WorkflowStep;
import com.tellme.entity.WorkflowTransition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WorkflowTransitionRepository extends JpaRepository<WorkflowTransition, Long> {
    List<WorkflowTransition> findByWorkflow(Workflow workflow);

    /** Các transition có fromStep = step hoặc fromStep = null (wildcard) */
    @Query("SELECT t FROM WorkflowTransition t WHERE t.workflow = :workflow " +
           "AND (t.fromStep = :step OR t.fromStep IS NULL)")
    List<WorkflowTransition> findAvailableFrom(@Param("workflow") Workflow workflow,
                                               @Param("step") WorkflowStep step);
}
