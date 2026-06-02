package com.tellme.service;

import com.tellme.dto.request.*;
import com.tellme.dto.response.*;
import com.tellme.entity.*;
import com.tellme.enums.*;
import com.tellme.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Handles: Watchers, Votes, Issue Links, Worklog, Clone, Move Issue,
 *          Components, Versions, Saved Filters, Reports.
 */
@Service
public class IssueFeatureService {

    @Autowired private IssueRepository issueRepository;
    @Autowired private IssueWatcherRepository watcherRepository;
    @Autowired private IssueVoteRepository voteRepository;
    @Autowired private IssueLinkRepository linkRepository;
    @Autowired private WorklogRepository worklogRepository;
    @Autowired private ComponentRepository componentRepository;
    @Autowired private VersionRepository versionRepository;
    @Autowired private SavedFilterRepository savedFilterRepository;
    @Autowired private ProjectRepository projectRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private ActivityLogRepository activityLogRepository;
    @Autowired private CommentRepository commentRepository;
    @Autowired private AttachmentRepository attachmentRepository;
    @Autowired private ProjectService projectService;
    @Autowired private AuthService authService;

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private Issue getIssue(Long id) {
        return issueRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Issue not found: " + id));
    }

    private User currentUser() {
        return authService.getCurrentUserEntity();
    }

    // ─── Watchers ────────────────────────────────────────────────────────────

    @Transactional
    public Map<String, Object> toggleWatch(Long issueId) {
        Issue issue = getIssue(issueId);
        User user = currentUser();
        boolean nowWatching;
        if (watcherRepository.existsByIssueAndUser(issue, user)) {
            watcherRepository.findByIssueAndUser(issue, user)
                    .ifPresent(watcherRepository::delete);
            nowWatching = false;
        } else {
            watcherRepository.save(IssueWatcher.builder().issue(issue).user(user).build());
            nowWatching = true;
        }
        Map<String, Object> res = new HashMap<>();
        res.put("watching", nowWatching);
        res.put("watchCount", watcherRepository.countByIssue(issue));
        return res;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getWatchStatus(Long issueId) {
        Issue issue = getIssue(issueId);
        User user = currentUser();
        Map<String, Object> res = new HashMap<>();
        res.put("watching", watcherRepository.existsByIssueAndUser(issue, user));
        res.put("watchCount", watcherRepository.countByIssue(issue));
        List<Map<String, Object>> watchers = watcherRepository.findByIssue(issue).stream()
                .map(w -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("id", w.getUser().getId());
                    m.put("fullName", w.getUser().getFullName());
                    m.put("avatarUrl", w.getUser().getAvatarUrl());
                    return m;
                }).collect(Collectors.toList());
        res.put("watchers", watchers);
        return res;
    }

    // ─── Votes ───────────────────────────────────────────────────────────────

    @Transactional
    public Map<String, Object> toggleVote(Long issueId) {
        Issue issue = getIssue(issueId);
        User user = currentUser();
        boolean nowVoted;
        if (voteRepository.existsByIssueAndUser(issue, user)) {
            voteRepository.findByIssueAndUser(issue, user)
                    .ifPresent(voteRepository::delete);
            nowVoted = false;
        } else {
            voteRepository.save(IssueVote.builder().issue(issue).user(user).build());
            nowVoted = true;
        }
        Map<String, Object> res = new HashMap<>();
        res.put("voted", nowVoted);
        res.put("voteCount", voteRepository.countByIssue(issue));
        return res;
    }

    // ─── Issue Links ─────────────────────────────────────────────────────────

    @Transactional
    public IssueLinkResponse addLink(Long issueId, IssueLinkRequest request) {
        Issue source = getIssue(issueId);
        Issue target = getIssue(request.getTargetIssueId());
        User user = currentUser();
        IssueLink link = IssueLink.builder()
                .sourceIssue(source)
                .targetIssue(target)
                .linkType(request.getLinkType())
                .createdBy(user)
                .build();
        IssueLink saved = linkRepository.save(link);
        return IssueLinkResponse.from(saved, true);
    }

    @Transactional
    public void deleteLink(Long linkId) {
        linkRepository.deleteById(linkId);
    }

    @Transactional(readOnly = true)
    public List<IssueLinkResponse> getLinks(Long issueId) {
        Issue issue = getIssue(issueId);
        return linkRepository.findAllByIssue(issue).stream()
                .map(link -> IssueLinkResponse.from(link,
                        link.getSourceIssue().getId().equals(issueId)))
                .collect(Collectors.toList());
    }

    // ─── Worklog ─────────────────────────────────────────────────────────────

    @Transactional
    public WorklogResponse addWorklog(Long issueId, WorklogRequest request) {
        Issue issue = getIssue(issueId);
        User user = currentUser();
        Worklog worklog = Worklog.builder()
                .issue(issue)
                .author(user)
                .timeSpentHours(request.getTimeSpentHours())
                .startedAt(request.getStartedAt() != null ? request.getStartedAt() : LocalDateTime.now())
                .description(request.getDescription())
                .build();
        Worklog saved = worklogRepository.save(worklog);
        // Recalculate timeSpentHours on issue
        recalcTimeSpent(issue);
        return WorklogResponse.from(saved);
    }

    @Transactional
    public WorklogResponse updateWorklog(Long worklogId, WorklogRequest request) {
        Worklog worklog = worklogRepository.findById(worklogId)
                .orElseThrow(() -> new RuntimeException("Worklog not found"));
        worklog.setTimeSpentHours(request.getTimeSpentHours());
        if (request.getStartedAt() != null) worklog.setStartedAt(request.getStartedAt());
        if (request.getDescription() != null) worklog.setDescription(request.getDescription());
        Worklog saved = worklogRepository.save(worklog);
        recalcTimeSpent(worklog.getIssue());
        return WorklogResponse.from(saved);
    }

    @Transactional
    public void deleteWorklog(Long worklogId) {
        Worklog worklog = worklogRepository.findById(worklogId)
                .orElseThrow(() -> new RuntimeException("Worklog not found"));
        Issue issue = worklog.getIssue();
        worklogRepository.delete(worklog);
        recalcTimeSpent(issue);
    }

    @Transactional(readOnly = true)
    public List<WorklogResponse> getWorklogs(Long issueId) {
        Issue issue = getIssue(issueId);
        return worklogRepository.findByIssueOrderByStartedAtDesc(issue).stream()
                .map(WorklogResponse::from).collect(Collectors.toList());
    }

    private void recalcTimeSpent(Issue issue) {
        Double total = worklogRepository.sumTimeSpentByIssue(issue);
        issue.setTimeSpentHours(total != null ? total : 0.0);
        issueRepository.save(issue);
    }

    // ─── Clone Issue ─────────────────────────────────────────────────────────

    @Transactional
    public IssueResponse cloneIssue(Long issueId) {
        Issue original = getIssue(issueId);
        User user = currentUser();

        long count = issueRepository.countByProject(original.getProject());
        String newKey = original.getProject().getKey() + "-" + (count + 1);

        Issue clone = Issue.builder()
                .project(original.getProject())
                .sprint(null) // clone starts in backlog
                .title("[Clone] " + original.getTitle())
                .description(original.getDescription())
                .type(original.getType())
                .status(IssueStatus.TODO)
                .priority(original.getPriority())
                .assignee(original.getAssignee())
                .reporter(user)
                .position(0)
                .issueKey(newKey)
                .severity(original.getSeverity())
                .module(original.getModule())
                .environment(original.getEnvironment())
                .businessImpact(original.getBusinessImpact())
                .originalEstimateHours(original.getOriginalEstimateHours())
                .dueDate(original.getDueDate())
                .slaHours(original.getSlaHours())
                .labels(original.getLabels())
                .component(original.getComponent())
                .fixVersion(original.getFixVersion())
                .affectsVersion(original.getAffectsVersion())
                .build();

        return IssueResponse.fromIssue(issueRepository.save(clone));
    }

    // ─── Move Issue ───────────────────────────────────────────────────────────

    @Transactional
    public IssueResponse moveIssue(Long issueId, Long targetProjectId) {
        Issue issue = getIssue(issueId);
        User user = currentUser();
        Project targetProject = projectRepository.findById(targetProjectId)
                .orElseThrow(() -> new RuntimeException("Target project not found"));
        projectService.getProjectWithAccessCheck(targetProjectId, user);

        long count = issueRepository.countByProject(targetProject);
        String newKey = targetProject.getKey() + "-" + (count + 1);

        issue.setProject(targetProject);
        issue.setSprint(null); // move to backlog
        issue.setIssueKey(newKey);
        issue.setComponent(null); // component belongs to old project
        issue.setFixVersion(null);
        issue.setAffectsVersion(null);

        return IssueResponse.fromIssue(issueRepository.save(issue));
    }

    // ─── Labels ───────────────────────────────────────────────────────────────

    @Transactional
    public IssueResponse updateLabels(Long issueId, String labels) {
        Issue issue = getIssue(issueId);
        issue.setLabels(labels);
        return IssueResponse.fromIssue(issueRepository.save(issue));
    }

    // ─── Components ───────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<ComponentResponse> getComponents(Long projectId) {
        User user = currentUser();
        Project project = projectService.getProjectWithAccessCheck(projectId, user);
        return componentRepository.findByProjectOrderByNameAsc(project)
                .stream().map(ComponentResponse::from).collect(Collectors.toList());
    }

    @Transactional
    public ComponentResponse createComponent(Long projectId, ComponentRequest request) {
        User user = currentUser();
        Project project = projectService.getProjectWithAccessCheck(projectId, user);
        if (componentRepository.existsByProjectAndName(project, request.getName())) {
            throw new RuntimeException("Component name already exists in this project");
        }
        User lead = request.getLeadId() != null
                ? userRepository.findById(request.getLeadId()).orElse(null) : null;
        Component comp = Component.builder()
                .project(project)
                .name(request.getName())
                .description(request.getDescription())
                .lead(lead)
                .build();
        return ComponentResponse.from(componentRepository.save(comp));
    }

    @Transactional
    public ComponentResponse updateComponent(Long componentId, ComponentRequest request) {
        Component comp = componentRepository.findById(componentId)
                .orElseThrow(() -> new RuntimeException("Component not found"));
        comp.setName(request.getName());
        comp.setDescription(request.getDescription());
        if (request.getLeadId() != null) {
            userRepository.findById(request.getLeadId()).ifPresent(comp::setLead);
        }
        return ComponentResponse.from(componentRepository.save(comp));
    }

    @Transactional
    public void deleteComponent(Long componentId) {
        componentRepository.deleteById(componentId);
    }

    // ─── Versions ────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<VersionResponse> getVersions(Long projectId) {
        User user = currentUser();
        Project project = projectService.getProjectWithAccessCheck(projectId, user);
        return versionRepository.findByProjectOrderByCreatedAtDesc(project)
                .stream().map(VersionResponse::from).collect(Collectors.toList());
    }

    @Transactional
    public VersionResponse createVersion(Long projectId, VersionRequest request) {
        User user = currentUser();
        Project project = projectService.getProjectWithAccessCheck(projectId, user);
        if (versionRepository.existsByProjectAndName(project, request.getName())) {
            throw new RuntimeException("Version name already exists in this project");
        }
        Version version = Version.builder()
                .project(project)
                .name(request.getName())
                .description(request.getDescription())
                .status(request.getStatus() != null ? request.getStatus() : VersionStatus.UNRELEASED)
                .releaseDate(request.getReleaseDate())
                .startDate(request.getStartDate())
                .build();
        return VersionResponse.from(versionRepository.save(version));
    }

    @Transactional
    public VersionResponse updateVersion(Long versionId, VersionRequest request) {
        Version version = versionRepository.findById(versionId)
                .orElseThrow(() -> new RuntimeException("Version not found"));
        if (request.getName() != null) version.setName(request.getName());
        if (request.getDescription() != null) version.setDescription(request.getDescription());
        if (request.getStatus() != null) version.setStatus(request.getStatus());
        if (request.getReleaseDate() != null) version.setReleaseDate(request.getReleaseDate());
        if (request.getStartDate() != null) version.setStartDate(request.getStartDate());
        return VersionResponse.from(versionRepository.save(version));
    }

    @Transactional
    public void deleteVersion(Long versionId) {
        versionRepository.deleteById(versionId);
    }

    // ─── Saved Filters ───────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<SavedFilterResponse> getSavedFilters() {
        User user = currentUser();
        return savedFilterRepository.findAccessibleFilters(user)
                .stream().map(SavedFilterResponse::from).collect(Collectors.toList());
    }

    @Transactional
    public SavedFilterResponse createSavedFilter(SavedFilterRequest request) {
        User user = currentUser();
        SavedFilter filter = SavedFilter.builder()
                .creator(user)
                .name(request.getName())
                .filterCriteria(request.getFilterCriteria())
                .isShared(Boolean.TRUE.equals(request.getIsShared()))
                .isFavorite(Boolean.TRUE.equals(request.getIsFavorite()))
                .build();
        return SavedFilterResponse.from(savedFilterRepository.save(filter));
    }

    @Transactional
    public SavedFilterResponse updateSavedFilter(Long filterId, SavedFilterRequest request) {
        SavedFilter filter = savedFilterRepository.findById(filterId)
                .orElseThrow(() -> new RuntimeException("Filter not found"));
        if (request.getName() != null) filter.setName(request.getName());
        if (request.getFilterCriteria() != null) filter.setFilterCriteria(request.getFilterCriteria());
        if (request.getIsShared() != null) filter.setIsShared(request.getIsShared());
        if (request.getIsFavorite() != null) filter.setIsFavorite(request.getIsFavorite());
        return SavedFilterResponse.from(savedFilterRepository.save(filter));
    }

    @Transactional
    public void deleteSavedFilter(Long filterId) {
        savedFilterRepository.deleteById(filterId);
    }

    // ─── Reports ─────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<IssueResponse> getOverdueIssues(Long projectId) {
        User user = currentUser();
        Project project = projectService.getProjectWithAccessCheck(projectId, user);
        LocalDateTime now = LocalDateTime.now();
        return issueRepository.findByProjectOrderByPositionAsc(project).stream()
                .filter(i -> i.getDueDate() != null
                        && i.getDueDate().isBefore(now)
                        && i.getStatus() != IssueStatus.DONE)
                .map(IssueResponse::fromIssue)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getWorkloadReport(Long projectId) {
        User user = currentUser();
        Project project = projectService.getProjectWithAccessCheck(projectId, user);
        List<Issue> issues = issueRepository.findByProjectOrderByPositionAsc(project);

        Map<Long, Map<String, Object>> byAssignee = new LinkedHashMap<>();
        for (Issue issue : issues) {
            if (issue.getAssignee() == null) continue;
            Long uid = issue.getAssignee().getId();
            byAssignee.computeIfAbsent(uid, k -> {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("userId", uid);
                m.put("userName", issue.getAssignee().getFullName());
                m.put("avatarUrl", issue.getAssignee().getAvatarUrl());
                m.put("total", 0);
                m.put("todo", 0);
                m.put("inProgress", 0);
                m.put("done", 0);
                m.put("overdue", 0);
                return m;
            });
            Map<String, Object> row = byAssignee.get(uid);
            row.put("total", (int) row.get("total") + 1);
            if (issue.getStatus() == IssueStatus.TODO) row.put("todo", (int) row.get("todo") + 1);
            if (issue.getStatus() == IssueStatus.IN_PROGRESS || issue.getStatus() == IssueStatus.TESTING)
                row.put("inProgress", (int) row.get("inProgress") + 1);
            if (issue.getStatus() == IssueStatus.DONE) row.put("done", (int) row.get("done") + 1);
            if (issue.getDueDate() != null && issue.getDueDate().isBefore(LocalDateTime.now())
                    && issue.getStatus() != IssueStatus.DONE)
                row.put("overdue", (int) row.get("overdue") + 1);
        }
        return new ArrayList<>(byAssignee.values());
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getCreatedVsResolvedReport(Long projectId, int days) {
        User user = currentUser();
        Project project = projectService.getProjectWithAccessCheck(projectId, user);
        List<Issue> issues = issueRepository.findByProjectOrderByPositionAsc(project);
        LocalDateTime from = LocalDateTime.now().minusDays(days);

        // Group by date
        Map<String, int[]> byDate = new LinkedHashMap<>();
        for (int i = days - 1; i >= 0; i--) {
            String date = LocalDateTime.now().minusDays(i).toLocalDate().toString();
            byDate.put(date, new int[]{0, 0}); // [created, resolved]
        }

        for (Issue issue : issues) {
            if (issue.getCreatedAt() != null && !issue.getCreatedAt().isBefore(from)) {
                String date = issue.getCreatedAt().toLocalDate().toString();
                if (byDate.containsKey(date)) byDate.get(date)[0]++;
            }
            if (issue.getResolutionDate() != null && !issue.getResolutionDate().isBefore(from)) {
                String date = issue.getResolutionDate().toLocalDate().toString();
                if (byDate.containsKey(date)) byDate.get(date)[1]++;
            }
        }

        List<String> labels = new ArrayList<>(byDate.keySet());
        List<Integer> created = new ArrayList<>();
        List<Integer> resolved = new ArrayList<>();
        byDate.values().forEach(v -> { created.add(v[0]); resolved.add(v[1]); });

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("labels", labels);
        result.put("created", created);
        result.put("resolved", resolved);
        return result;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getResolutionTimeReport(Long projectId) {
        User user = currentUser();
        Project project = projectService.getProjectWithAccessCheck(projectId, user);
        List<Issue> issues = issueRepository.findByProjectOrderByPositionAsc(project).stream()
                .filter(i -> i.getResolutionDate() != null && i.getCreatedAt() != null)
                .collect(Collectors.toList());

        if (issues.isEmpty()) {
            Map<String, Object> empty = new HashMap<>();
            empty.put("avgHours", 0);
            empty.put("count", 0);
            empty.put("byType", Collections.emptyList());
            return empty;
        }

        double totalHours = issues.stream()
                .mapToDouble(i -> java.time.Duration.between(i.getCreatedAt(), i.getResolutionDate()).toHours())
                .sum();
        double avgHours = totalHours / issues.size();

        // By type
        Map<String, List<Issue>> byType = issues.stream()
                .collect(Collectors.groupingBy(i -> i.getType().name()));
        List<Map<String, Object>> byTypeList = byType.entrySet().stream().map(e -> {
            double avg = e.getValue().stream()
                    .mapToDouble(i -> java.time.Duration.between(i.getCreatedAt(), i.getResolutionDate()).toHours())
                    .average().orElse(0);
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("type", e.getKey());
            m.put("count", e.getValue().size());
            m.put("avgHours", Math.round(avg * 10.0) / 10.0);
            return m;
        }).collect(Collectors.toList());

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("avgHours", Math.round(avgHours * 10.0) / 10.0);
        result.put("count", issues.size());
        result.put("byType", byTypeList);
        return result;
    }
}
