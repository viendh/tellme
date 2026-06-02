package com.tellme.repository;

import com.tellme.entity.Issue;
import com.tellme.entity.User;
import com.tellme.entity.WorkflowApproval;
import com.tellme.enums.WorkflowApprovalStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WorkflowApprovalRepository extends JpaRepository<WorkflowApproval, Long> {

    List<WorkflowApproval> findByIssueOrderByCreatedAtDesc(Issue issue);

    List<WorkflowApproval> findByIssueAndStatus(Issue issue, WorkflowApprovalStatus status);

    /** Tất cả phê duyệt PENDING mà user này phải xử lý (theo approverRole trong transition) */
    @Query("SELECT a FROM WorkflowApproval a " +
           "JOIN a.transition t " +
           "JOIN a.issue i " +
           "JOIN i.project p " +
           "LEFT JOIN p.members m " +
           "WHERE a.status = 'PENDING' AND (" +
           "  (t.approverRole = 'ADMIN'   AND :isAdmin = true) OR " +
           "  (t.approverRole = 'MANAGER' AND (m.user = :user AND m.role IN ('OWNER','MANAGER'))) OR " +
           "  (t.approverRole = 'REPORTER' AND i.reporter = :user)" +
           ") ORDER BY a.createdAt DESC")
    List<WorkflowApproval> findPendingForUser(@Param("user") User user,
                                              @Param("isAdmin") boolean isAdmin);
}
