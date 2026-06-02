package com.tellme.repository;

import com.tellme.entity.Issue;
import com.tellme.entity.User;
import com.tellme.entity.Worklog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WorklogRepository extends JpaRepository<Worklog, Long> {
    List<Worklog> findByIssueOrderByStartedAtDesc(Issue issue);
    List<Worklog> findByAuthorOrderByStartedAtDesc(User author);
    void deleteByIssue(Issue issue);

    @Query("SELECT COALESCE(SUM(w.timeSpentHours), 0) FROM Worklog w WHERE w.issue = :issue")
    Double sumTimeSpentByIssue(@Param("issue") Issue issue);
}
