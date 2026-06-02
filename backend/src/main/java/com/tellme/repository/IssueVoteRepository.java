package com.tellme.repository;

import com.tellme.entity.Issue;
import com.tellme.entity.IssueVote;
import com.tellme.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface IssueVoteRepository extends JpaRepository<IssueVote, Long> {
    Optional<IssueVote> findByIssueAndUser(Issue issue, User user);
    boolean existsByIssueAndUser(Issue issue, User user);
    long countByIssue(Issue issue);
    void deleteByIssue(Issue issue);
}
