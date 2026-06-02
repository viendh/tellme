package com.tellme.repository;

import com.tellme.entity.Issue;
import com.tellme.entity.Project;
import com.tellme.entity.Sprint;
import com.tellme.entity.User;
import com.tellme.enums.IssueStatus;
import com.tellme.enums.IssuePriority;
import com.tellme.enums.IssueType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IssueRepository extends JpaRepository<Issue, Long> {

    List<Issue> findByProjectOrderByPositionAsc(Project project);

    List<Issue> findByProjectAndSprintOrderByPositionAsc(Project project, Sprint sprint);

    List<Issue> findByProjectAndSprintIsNullOrderByPositionAsc(Project project);

    List<Issue> findByProjectAndStatusOrderByPositionAsc(Project project, IssueStatus status);

    List<Issue> findByProjectAndAssigneeOrderByPositionAsc(Project project, User assignee);

    @Query("SELECT i FROM Issue i WHERE i.project = :project AND i.sprint = :sprint AND i.status = :status ORDER BY i.position ASC")
    List<Issue> findByProjectAndSprintAndStatus(@Param("project") Project project,
                                                 @Param("sprint") Sprint sprint,
                                                 @Param("status") IssueStatus status);

    @Query("SELECT i FROM Issue i WHERE i.project = :project AND i.sprint IS NULL AND i.status = :status ORDER BY i.position ASC")
    List<Issue> findByProjectAndSprintIsNullAndStatus(@Param("project") Project project,
                                                       @Param("status") IssueStatus status);

    @Query("SELECT i FROM Issue i WHERE i.project = :project AND i.sprint = :sprint AND i.assignee = :assignee ORDER BY i.position ASC")
    List<Issue> findByProjectAndSprintAndAssignee(@Param("project") Project project,
                                                   @Param("sprint") Sprint sprint,
                                                   @Param("assignee") User assignee);

    @Query("SELECT i FROM Issue i WHERE i.project = :project AND i.sprint IS NULL AND i.assignee = :assignee ORDER BY i.position ASC")
    List<Issue> findByProjectAndSprintIsNullAndAssignee(@Param("project") Project project,
                                                         @Param("assignee") User assignee);

    @Query("SELECT MAX(i.position) FROM Issue i WHERE i.project = :project AND i.status = :status AND (i.sprint = :sprint OR (:sprint IS NULL AND i.sprint IS NULL))")
    Integer findMaxPositionByProjectAndStatusAndSprint(@Param("project") Project project,
                                                        @Param("status") IssueStatus status,
                                                        @Param("sprint") Sprint sprint);

    long countByProject(Project project);

    long countByParentIssue(Issue parentIssue);

    List<Issue> findByParentIssueOrderByCreatedAtAsc(Issue parentIssue);

    List<Issue> findByProjectAndParentIssueIsNullOrderByCreatedAtAsc(Project project);

    @Query("SELECT i FROM Issue i WHERE i.project.id IN :projectIds " +
           "AND (:status IS NULL OR i.status = :status) " +
           "AND (:priority IS NULL OR i.priority = :priority) " +
           "AND (:type IS NULL OR i.type = :type) " +
           "AND (:assigneeId IS NULL OR (i.assignee IS NOT NULL AND i.assignee.id = :assigneeId)) " +
           "ORDER BY i.updatedAt DESC")
    List<Issue> advancedSearch(@Param("projectIds") List<Long> projectIds,
                               @Param("status") IssueStatus status,
                               @Param("priority") IssuePriority priority,
                               @Param("type") IssueType type,
                               @Param("assigneeId") Long assigneeId);

    long countByAssignee(User assignee);

    long countByAssigneeAndStatus(User assignee, IssueStatus status);

    long countByAssigneeAndDueDateBeforeAndStatusNot(User assignee, java.time.LocalDateTime date, IssueStatus status);

    List<Issue> findTop5ByAssigneeOrderByUpdatedAtDesc(User assignee);

    List<Issue> findByAssigneeOrderByUpdatedAtDesc(User assignee);
}
