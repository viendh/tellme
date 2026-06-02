package com.tellme.repository;

import com.tellme.entity.Attachment;
import com.tellme.entity.Issue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AttachmentRepository extends JpaRepository<Attachment, Long> {
    List<Attachment> findByIssueOrderByCreatedAtDesc(Issue issue);

    void deleteByIssue(Issue issue);
}
