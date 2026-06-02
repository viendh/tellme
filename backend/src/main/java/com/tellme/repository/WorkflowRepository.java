package com.tellme.repository;

import com.tellme.entity.Workflow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WorkflowRepository extends JpaRepository<Workflow, Long> {
    List<Workflow> findAllByOrderByCreatedAtDesc();
    Optional<Workflow> findByIsDefaultTrue();
}
