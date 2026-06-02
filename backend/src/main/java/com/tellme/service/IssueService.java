package com.tellme.service;

import com.tellme.dto.request.IssueRequest;
import com.tellme.dto.request.IssueSprintRequest;
import com.tellme.dto.request.IssueStatusRequest;
import com.tellme.dto.response.ActivityLogResponse;
import com.tellme.dto.response.AttachmentResponse;
import com.tellme.dto.response.CommentResponse;
import com.tellme.dto.response.IssueResponse;
import com.tellme.entity.*;
import com.tellme.entity.Attachment;
import com.tellme.enums.IssueStatus;
import com.tellme.enums.IssueType;
import com.tellme.enums.IssuePriority;
import com.tellme.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class IssueService {

    @Autowired
    private IssueRepository issueRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private SprintRepository sprintRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ActivityLogRepository activityLogRepository;

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private AttachmentRepository attachmentRepository;

    @Autowired
    private ProjectService projectService;

    @Autowired
    private AuthService authService;

    @Autowired
    private EmailService emailService;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private IssueWatcherRepository watcherRepository;

    @Autowired
    private IssueVoteRepository voteRepository;

    @Transactional(readOnly = true)
    public List<IssueResponse> getProjectIssues(Long projectId, String sprintIdParam,
                                                  String statusParam, Long assigneeId) {
        User currentUser = authService.getCurrentUserEntity();
        Project project = projectService.getProjectWithAccessCheck(projectId, currentUser);

        List<Issue> issues;

        // Determine sprint filter
        Sprint sprint = null;
        boolean isBacklog = "backlog".equalsIgnoreCase(sprintIdParam);
        boolean hasSprintFilter = sprintIdParam != null && !sprintIdParam.isEmpty();

        if (hasSprintFilter && !isBacklog) {
            Long sprintId = Long.parseLong(sprintIdParam);
            sprint = sprintRepository.findById(sprintId)
                    .orElseThrow(() -> new RuntimeException("Sprint not found"));
        }

        // Determine assignee filter
        User assignee = null;
        if (assigneeId != null) {
            assignee = userRepository.findById(assigneeId)
                    .orElseThrow(() -> new RuntimeException("Assignee not found"));
        }

        // Determine status filter
        IssueStatus status = null;
        if (statusParam != null && !statusParam.isEmpty()) {
            try {
                status = IssueStatus.valueOf(statusParam.toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new RuntimeException("Invalid status: " + statusParam);
            }
        }

        // Apply filters
        if (isBacklog) {
            if (status != null && assignee != null) {
                issues = issueRepository.findByProjectAndSprintIsNullAndStatus(project, status)
                        .stream()
                        .filter(i -> i.getAssignee() != null && i.getAssignee().getId().equals(assigneeId))
                        .collect(Collectors.toList());
            } else if (status != null) {
                issues = issueRepository.findByProjectAndSprintIsNullAndStatus(project, status);
            } else if (assignee != null) {
                issues = issueRepository.findByProjectAndSprintIsNullAndAssignee(project, assignee);
            } else {
                issues = issueRepository.findByProjectAndSprintIsNullOrderByPositionAsc(project);
            }
        } else if (hasSprintFilter) {
            if (status != null && assignee != null) {
                issues = issueRepository.findByProjectAndSprintAndStatus(project, sprint, status)
                        .stream()
                        .filter(i -> i.getAssignee() != null && i.getAssignee().getId().equals(assigneeId))
                        .collect(Collectors.toList());
            } else if (status != null) {
                issues = issueRepository.findByProjectAndSprintAndStatus(project, sprint, status);
            } else if (assignee != null) {
                issues = issueRepository.findByProjectAndSprintAndAssignee(project, sprint, assignee);
            } else {
                issues = issueRepository.findByProjectAndSprintOrderByPositionAsc(project, sprint);
            }
        } else {
            if (status != null) {
                issues = issueRepository.findByProjectAndStatusOrderByPositionAsc(project, status);
            } else if (assignee != null) {
                issues = issueRepository.findByProjectAndAssigneeOrderByPositionAsc(project, assignee);
            } else {
                issues = issueRepository.findByProjectOrderByPositionAsc(project);
            }
        }

        if (issues.isEmpty()) {
            return java.util.Collections.emptyList();
        }

        // Fetch latest comment per issue in a single query (no N+1)
        Map<Long, Comment> latestByIssue = new LinkedHashMap<>();
        commentRepository.findByIssueInOrderByCreatedAtDesc(issues)
                .forEach(c -> latestByIssue.putIfAbsent(c.getIssue().getId(), c));

        return issues.stream()
                .map(issue -> {
                    IssueResponse r = IssueResponse.fromIssue(issue);
                    Comment lc = latestByIssue.get(issue.getId());
                    if (lc != null) {
                        String raw = lc.getContent() != null ? lc.getContent() : "";
                        r.setLastCommentContent(raw.length() > 120 ? raw.substring(0, 120) + "…" : raw);
                        r.setLastCommentAuthor(lc.getAuthor().getFullName());
                        r.setLastCommentAt(lc.getCreatedAt());
                    }
                    return r;
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public IssueResponse createIssue(Long projectId, IssueRequest request) {
        User currentUser = authService.getCurrentUserEntity();
        Project project = projectService.getProjectWithAccessCheck(projectId, currentUser);

        Sprint sprint = null;
        if (request.getSprintId() != null) {
            sprint = sprintRepository.findById(request.getSprintId())
                    .orElseThrow(() -> new RuntimeException("Sprint not found"));
        }

        User assignee = null;
        if (request.getAssigneeId() != null) {
            assignee = userRepository.findById(request.getAssigneeId())
                    .orElseThrow(() -> new RuntimeException("Assignee not found"));
        }

        IssueType type = request.getType() != null ? request.getType() : IssueType.TASK;
        IssuePriority priority = request.getPriority() != null ? request.getPriority() : IssuePriority.MEDIUM;
        IssueStatus status = request.getStatus() != null ? request.getStatus() : IssueStatus.TODO;

        Integer position = request.getPosition();
        if (position == null) {
            Integer maxPos = issueRepository.findMaxPositionByProjectAndStatusAndSprint(project, status, sprint);
            position = (maxPos != null ? maxPos : -1) + 1;
        }

        Issue issue = Issue.builder()
                .project(project)
                .sprint(sprint)
                .title(request.getTitle())
                .description(request.getDescription())
                .type(type)
                .status(status)
                .priority(priority)
                .assignee(assignee)
                .reporter(currentUser)
                .position(position)
                .severity(request.getSeverity())
                .module(request.getModule())
                .environment(request.getEnvironment())
                .businessImpact(request.getBusinessImpact())
                .rootCause(request.getRootCause())
                .dueDate(request.getDueDate())
                .startDate(request.getStartDate())
                .originalEstimateHours(request.getOriginalEstimateHours())
                .remainingEstimateHours(request.getRemainingEstimateHours())
                .timeSpentHours(request.getTimeSpentHours() != null ? request.getTimeSpentHours() : 0.0)
                .progressPercent(request.getProgressPercent() != null ? request.getProgressPercent() : 0.0)
                .slaHours(request.getSlaHours())
                .build();

        // Set parent issue and generate hierarchical key
        if (request.getParentIssueId() != null) {
            Issue parent = issueRepository.findById(request.getParentIssueId())
                    .orElseThrow(() -> new RuntimeException("Parent issue not found"));
            issue.setParentIssue(parent);
            long siblingCount = issueRepository.countByParentIssue(parent);
            issue.setIssueKey(parent.getIssueKey() + "." + (siblingCount + 1));
        } else {
            long count = issueRepository.countByProject(project);
            issue.setIssueKey(project.getKey() + "-" + (count + 1));
        }

        issue = issueRepository.save(issue);

        // Log creation activity
        logActivity(issue, currentUser, "created issue", "title", null, issue.getTitle());

        emailService.sendIssueCreated(issue);
        if (issue.getAssignee() != null) {
            notificationService.pushIssueAssigned(issue.getAssignee(), issue, currentUser);
        }

        return IssueResponse.fromIssue(issue);
    }

    @Transactional(readOnly = true)
    public IssueResponse getIssueById(Long issueId) {
        User currentUser = authService.getCurrentUserEntity();
        Issue issue = getIssueWithAccessCheck(issueId, currentUser);

        IssueResponse response = IssueResponse.fromIssue(issue);

        // Attach comments
        List<Comment> comments = commentRepository.findByIssueOrderByCreatedAtDesc(issue);
        response.setComments(comments.stream()
                .map(CommentResponse::fromComment)
                .collect(Collectors.toList()));

        // Attach activity
        List<ActivityLog> activity = activityLogRepository.findByIssueOrderByCreatedAtDesc(issue);
        response.setActivity(activity.stream()
                .map(ActivityLogResponse::fromActivityLog)
                .collect(Collectors.toList()));

        // Attach files
        List<Attachment> attachments = attachmentRepository.findByIssueOrderByCreatedAtDesc(issue);
        response.setAttachments(attachments.stream()
                .map(AttachmentResponse::fromAttachment)
                .collect(Collectors.toList()));

        // Watch/vote status for current user
        response.setWatchCount(watcherRepository.countByIssue(issue));
        response.setVoteCount(voteRepository.countByIssue(issue));
        response.setWatching(watcherRepository.existsByIssueAndUser(issue, currentUser));
        response.setVoted(voteRepository.existsByIssueAndUser(issue, currentUser));

        return response;
    }

    @Transactional
    public IssueResponse updateIssue(Long issueId, IssueRequest request) {
        User currentUser = authService.getCurrentUserEntity();
        Issue issue = getIssueWithAccessCheck(issueId, currentUser);

        // Track changes for activity log
        if (request.getTitle() != null && !request.getTitle().equals(issue.getTitle())) {
            logActivity(issue, currentUser, "changed title", "title", issue.getTitle(), request.getTitle());
            issue.setTitle(request.getTitle());
        }

        if (request.getDescription() != null && !request.getDescription().equals(issue.getDescription())) {
            logActivity(issue, currentUser, "changed description", "description",
                    issue.getDescription(), request.getDescription());
            issue.setDescription(request.getDescription());
        }

        if (request.getStatus() != null && !request.getStatus().equals(issue.getStatus())) {
            emailService.sendStatusChanged(issue, issue.getStatus().name(), request.getStatus().name(), currentUser);
            notificationService.pushStatusChanged(issue, request.getStatus().name(), currentUser);
            logActivity(issue, currentUser, "changed status", "status",
                    issue.getStatus().name(), request.getStatus().name());
            issue.setStatus(request.getStatus());
            // Auto-set/clear resolution date based on DONE status
            if (request.getStatus() == IssueStatus.DONE) {
                issue.setResolutionDate(LocalDateTime.now());
            } else {
                issue.setResolutionDate(null);
            }
        }

        if (request.getPriority() != null && !request.getPriority().equals(issue.getPriority())) {
            logActivity(issue, currentUser, "changed priority", "priority",
                    issue.getPriority().name(), request.getPriority().name());
            issue.setPriority(request.getPriority());
        }

        if (request.getType() != null && !request.getType().equals(issue.getType())) {
            logActivity(issue, currentUser, "changed type", "type",
                    issue.getType().name(), request.getType().name());
            issue.setType(request.getType());
        }

        if (request.getPosition() != null) {
            issue.setPosition(request.getPosition());
        }

        // Handle assignee change
        Long currentAssigneeId = issue.getAssignee() != null ? issue.getAssignee().getId() : null;
        if (request.getAssigneeId() != null) {
            if (!request.getAssigneeId().equals(currentAssigneeId)) {
                User newAssignee = userRepository.findById(request.getAssigneeId())
                        .orElseThrow(() -> new RuntimeException("Assignee not found"));
                String oldName = issue.getAssignee() != null ? issue.getAssignee().getFullName() : "unassigned";
                logActivity(issue, currentUser, "changed assignee", "assignee",
                        oldName, newAssignee.getFullName());
                issue.setAssignee(newAssignee);
                emailService.sendIssueAssigned(newAssignee, issue, currentUser);
                notificationService.pushIssueAssigned(newAssignee, issue, currentUser);
            }
        } else if (currentAssigneeId != null) {
            // Explicitly setting assignee to null
            logActivity(issue, currentUser, "changed assignee", "assignee",
                    issue.getAssignee().getFullName(), "unassigned");
            issue.setAssignee(null);
        }

        // Handle sprint change
        Long currentSprintId = issue.getSprint() != null ? issue.getSprint().getId() : null;
        boolean sprintKeyPresent = request.getSprintId() != null || currentSprintId != null;
        if (sprintKeyPresent) {
            if (request.getSprintId() != null && !request.getSprintId().equals(currentSprintId)) {
                Sprint newSprint = sprintRepository.findById(request.getSprintId())
                        .orElseThrow(() -> new RuntimeException("Sprint not found"));
                String oldSprint = issue.getSprint() != null ? issue.getSprint().getName() : "backlog";
                logActivity(issue, currentUser, "moved to sprint", "sprint",
                        oldSprint, newSprint.getName());
                issue.setSprint(newSprint);
            } else if (request.getSprintId() == null && currentSprintId != null) {
                String oldSprint = issue.getSprint().getName();
                logActivity(issue, currentUser, "moved to backlog", "sprint", oldSprint, "backlog");
                issue.setSprint(null);
            }
        }

        // Update new fields
        if (request.getSeverity() != null) {
            issue.setSeverity(request.getSeverity());
        }
        if (request.getParentIssueId() != null) {
            issueRepository.findById(request.getParentIssueId()).ifPresent(issue::setParentIssue);
        }
        if (request.getModule() != null) {
            issue.setModule(request.getModule());
        }
        if (request.getEnvironment() != null) {
            issue.setEnvironment(request.getEnvironment());
        }
        if (request.getBusinessImpact() != null) {
            issue.setBusinessImpact(request.getBusinessImpact());
        }
        if (request.getRootCause() != null) {
            issue.setRootCause(request.getRootCause());
        }
        if (request.getDueDate() != null) {
            issue.setDueDate(request.getDueDate());
        }
        if (request.getStartDate() != null) {
            issue.setStartDate(request.getStartDate());
        }
        if (request.getOriginalEstimateHours() != null) {
            issue.setOriginalEstimateHours(request.getOriginalEstimateHours());
        }
        if (request.getRemainingEstimateHours() != null) {
            issue.setRemainingEstimateHours(request.getRemainingEstimateHours());
        }
        if (request.getTimeSpentHours() != null) {
            issue.setTimeSpentHours(request.getTimeSpentHours());
        }
        if (request.getProgressPercent() != null) {
            issue.setProgressPercent(request.getProgressPercent());
        }
        if (request.getSlaHours() != null) {
            issue.setSlaHours(request.getSlaHours());
        }

        issue = issueRepository.save(issue);
        return IssueResponse.fromIssue(issue);
    }

    @Transactional
    public void deleteIssue(Long issueId) {
        User currentUser = authService.getCurrentUserEntity();
        Issue issue = getIssueWithAccessCheck(issueId, currentUser);
        deleteIssueRecursive(issue);
    }

    private void deleteIssueRecursive(Issue issue) {
        for (Issue subtask : issueRepository.findByParentIssueOrderByCreatedAtAsc(issue)) {
            deleteIssueRecursive(subtask);
        }
        activityLogRepository.deleteByIssue(issue);
        commentRepository.deleteByIssue(issue);
        attachmentRepository.deleteByIssue(issue);
        issueRepository.delete(issue);
    }

    @Transactional
    public IssueResponse updateIssueStatus(Long issueId, IssueStatusRequest request) {
        User currentUser = authService.getCurrentUserEntity();
        Issue issue = getIssueWithAccessCheck(issueId, currentUser);

        if (!request.getStatus().equals(issue.getStatus())) {
            logActivity(issue, currentUser, "changed status", "status",
                    issue.getStatus().name(), request.getStatus().name());
            issue.setStatus(request.getStatus());
        }

        if (request.getPosition() != null) {
            issue.setPosition(request.getPosition());
        }

        issue = issueRepository.save(issue);
        return IssueResponse.fromIssue(issue);
    }

    @Transactional
    public IssueResponse updateIssueSprint(Long issueId, IssueSprintRequest request) {
        User currentUser = authService.getCurrentUserEntity();
        Issue issue = getIssueWithAccessCheck(issueId, currentUser);

        String oldSprint = issue.getSprint() != null ? issue.getSprint().getName() : "backlog";

        if (request.getSprintId() != null) {
            Sprint newSprint = sprintRepository.findById(request.getSprintId())
                    .orElseThrow(() -> new RuntimeException("Sprint not found"));
            logActivity(issue, currentUser, "moved to sprint", "sprint", oldSprint, newSprint.getName());
            issue.setSprint(newSprint);
        } else {
            logActivity(issue, currentUser, "moved to backlog", "sprint", oldSprint, "backlog");
            issue.setSprint(null);
        }

        issue = issueRepository.save(issue);
        return IssueResponse.fromIssue(issue);
    }

    @Transactional(readOnly = true)
    public List<ActivityLogResponse> getIssueActivity(Long issueId) {
        User currentUser = authService.getCurrentUserEntity();
        Issue issue = getIssueWithAccessCheck(issueId, currentUser);

        return activityLogRepository.findByIssueOrderByCreatedAtDesc(issue)
                .stream()
                .map(ActivityLogResponse::fromActivityLog)
                .collect(Collectors.toList());
    }

    @Transactional
    public IssueResponse assignIssue(Long issueId, Long assigneeId) {
        User currentUser = authService.getCurrentUserEntity();
        Issue issue = getIssueWithAccessCheck(issueId, currentUser);

        String oldAssignee = issue.getAssignee() != null ? issue.getAssignee().getFullName() : "unassigned";

        if (assigneeId != null) {
            User assignee = userRepository.findById(assigneeId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            logActivity(issue, currentUser, "changed assignee", "assignee", oldAssignee, assignee.getFullName());
            issue.setAssignee(assignee);
            emailService.sendIssueAssigned(assignee, issue, currentUser);
        } else {
            logActivity(issue, currentUser, "changed assignee", "assignee", oldAssignee, "unassigned");
            issue.setAssignee(null);
        }

        issue = issueRepository.save(issue);
        return IssueResponse.fromIssue(issue);
    }

    @Transactional(readOnly = true)
    public List<IssueResponse> getMyIssues() {
        User currentUser = authService.getCurrentUserEntity();
        return issueRepository.findByAssigneeOrderByUpdatedAtDesc(currentUser)
                .stream()
                .map(IssueResponse::fromIssue)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<IssueResponse> getSubtasks(Long issueId) {
        User currentUser = authService.getCurrentUserEntity();
        Issue issue = getIssueWithAccessCheck(issueId, currentUser);
        return issueRepository.findByParentIssueOrderByCreatedAtAsc(issue)
                .stream()
                .map(IssueResponse::fromIssue)
                .collect(Collectors.toList());
    }

    // Helper methods
    public Issue getIssueWithAccessCheck(Long issueId, User user) {
        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new RuntimeException("Issue not found with id: " + issueId));

        projectService.getProjectWithAccessCheck(issue.getProject().getId(), user);
        return issue;
    }

    // ─── Advanced Search ──────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<IssueResponse> advancedSearch(
            Long projectId,
            String statusParam,
            String priorityParam,
            String typeParam,
            Long assigneeId,
            String q) {

        User currentUser = authService.getCurrentUserEntity();

        // Determine project scope: specific project or all accessible projects
        List<Long> projectIds;
        if (projectId != null) {
            projectService.getProjectWithAccessCheck(projectId, currentUser);
            projectIds = java.util.Collections.singletonList(projectId);
        } else {
            // All projects the user has access to
            projectIds = projectRepository.findAll().stream()
                    .filter(p -> {
                        try { projectService.getProjectWithAccessCheck(p.getId(), currentUser); return true; }
                        catch (Exception e) { return false; }
                    })
                    .map(Project::getId)
                    .collect(Collectors.toList());
        }

        if (projectIds.isEmpty()) return java.util.Collections.emptyList();

        IssueStatus status = null;
        if (statusParam != null && !statusParam.isEmpty()) {
            try { status = IssueStatus.valueOf(statusParam.toUpperCase()); } catch (Exception ignored) {}
        }
        IssuePriority priority = null;
        if (priorityParam != null && !priorityParam.isEmpty()) {
            try { priority = IssuePriority.valueOf(priorityParam.toUpperCase()); } catch (Exception ignored) {}
        }
        IssueType type = null;
        if (typeParam != null && !typeParam.isEmpty()) {
            try { type = IssueType.valueOf(typeParam.toUpperCase()); } catch (Exception ignored) {}
        }

        List<Issue> results = issueRepository.advancedSearch(projectIds, status, priority, type, assigneeId);

        // Apply text search in-memory (title / key / labels)
        if (q != null && !q.trim().isEmpty()) {
            String lq = q.trim().toLowerCase();
            results = results.stream()
                    .filter(i -> i.getTitle().toLowerCase().contains(lq)
                            || (i.getIssueKey() != null && i.getIssueKey().toLowerCase().contains(lq))
                            || (i.getLabels() != null && i.getLabels().toLowerCase().contains(lq)))
                    .collect(Collectors.toList());
        }

        return results.stream().map(IssueResponse::fromIssue).collect(Collectors.toList());
    }

    private void logActivity(Issue issue, User user, String action,
                              String fieldName, String oldValue, String newValue) {
        ActivityLog log = ActivityLog.builder()
                .issue(issue)
                .user(user)
                .action(action)
                .fieldName(fieldName)
                .oldValue(oldValue)
                .newValue(newValue)
                .build();
        activityLogRepository.save(log);
    }
}
