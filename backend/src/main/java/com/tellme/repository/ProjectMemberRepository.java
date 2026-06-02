package com.tellme.repository;

import com.tellme.entity.Project;
import com.tellme.entity.ProjectMember;
import com.tellme.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectMemberRepository extends JpaRepository<ProjectMember, Long> {

    List<ProjectMember> findByProject(Project project);

    Optional<ProjectMember> findByProjectAndUser(Project project, User user);

    boolean existsByProjectAndUser(Project project, User user);

    void deleteByProjectAndUser(Project project, User user);
}
