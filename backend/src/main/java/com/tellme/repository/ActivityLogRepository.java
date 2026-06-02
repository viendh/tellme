package com.tellme.repository;

import com.tellme.entity.ActivityLog;
import com.tellme.entity.Issue;
import com.tellme.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {

    List<ActivityLog> findByIssueOrderByCreatedAtDesc(Issue issue);

    void deleteByIssue(Issue issue);

    List<ActivityLog> findTop10ByIssueProjectOrderByCreatedAtDesc(Project project);
}
