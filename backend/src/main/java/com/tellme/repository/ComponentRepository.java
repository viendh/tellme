package com.tellme.repository;

import com.tellme.entity.Component;
import com.tellme.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ComponentRepository extends JpaRepository<Component, Long> {
    List<Component> findByProjectOrderByNameAsc(Project project);
    Optional<Component> findByProjectAndName(Project project, String name);
    boolean existsByProjectAndName(Project project, String name);
}
