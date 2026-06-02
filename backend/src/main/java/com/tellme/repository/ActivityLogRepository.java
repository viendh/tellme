package com.tellme.repository;

import com.tellme.entity.ActivityLog;
import com.tellme.entity.Issue;
import com.tellme.entity.Project;
import com.tellme.entity.Sprint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {

    List<ActivityLog> findByIssueOrderByCreatedAtDesc(Issue issue);

    void deleteByIssue(Issue issue);

    List<ActivityLog> findTop10ByIssueProjectOrderByCreatedAtDesc(Project project);

    @Query("SELECT a FROM ActivityLog a WHERE a.issue.sprint = :sprint AND a.fieldName = 'status' ORDER BY a.createdAt ASC")
    List<ActivityLog> findStatusChangesBySprintOrderByCreatedAt(@Param("sprint") Sprint sprint);
}
