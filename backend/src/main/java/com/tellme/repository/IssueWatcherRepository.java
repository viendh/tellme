package com.tellme.repository;

import com.tellme.entity.Issue;
import com.tellme.entity.IssueWatcher;
import com.tellme.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface IssueWatcherRepository extends JpaRepository<IssueWatcher, Long> {
    List<IssueWatcher> findByIssue(Issue issue);
    Optional<IssueWatcher> findByIssueAndUser(Issue issue, User user);
    boolean existsByIssueAndUser(Issue issue, User user);
    long countByIssue(Issue issue);
    void deleteByIssue(Issue issue);
}
