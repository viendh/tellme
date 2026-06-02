package com.tellme.repository;

import com.tellme.entity.Project;
import com.tellme.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {

    List<Project> findByOwner(User owner);

    @Query("SELECT DISTINCT p FROM Project p JOIN p.members m WHERE m.user = :user")
    List<Project> findProjectsByMember(@Param("user") User user);

    @Query("SELECT DISTINCT p FROM Project p LEFT JOIN p.members m WHERE p.owner = :user OR m.user = :user")
    List<Project> findAllUserProjects(@Param("user") User user);
}
