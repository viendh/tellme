package com.tellme.repository;

import com.tellme.entity.Comment;
import com.tellme.entity.Issue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {

    List<Comment> findByIssueOrderByCreatedAtDesc(Issue issue);

    void deleteByIssue(Issue issue);

    /**
     * Fetches all comments for the given issues, newest first.
     * One query — caller keeps the first per issueId to get the latest.
     */
    @Query("SELECT c FROM Comment c WHERE c.issue IN :issues ORDER BY c.createdAt DESC")
    List<Comment> findByIssueInOrderByCreatedAtDesc(@Param("issues") List<Issue> issues);
}
