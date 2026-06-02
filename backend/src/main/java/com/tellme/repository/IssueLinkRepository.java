package com.tellme.repository;

import com.tellme.entity.Issue;
import com.tellme.entity.IssueLink;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IssueLinkRepository extends JpaRepository<IssueLink, Long> {

    @Query("SELECT l FROM IssueLink l WHERE l.sourceIssue = :issue OR l.targetIssue = :issue")
    List<IssueLink> findAllByIssue(@Param("issue") Issue issue);

    @Query("DELETE FROM IssueLink l WHERE l.sourceIssue = :issue OR l.targetIssue = :issue")
    @org.springframework.data.jpa.repository.Modifying
    void deleteAllByIssue(@Param("issue") Issue issue);
}
