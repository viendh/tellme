package com.tellme.service;

import com.tellme.dto.request.SprintRequest;
import com.tellme.dto.response.BurndownPoint;
import com.tellme.dto.response.SprintResponse;
import com.tellme.entity.ActivityLog;
import com.tellme.entity.Issue;
import com.tellme.entity.Project;
import com.tellme.entity.Sprint;
import com.tellme.entity.User;
import com.tellme.enums.IssueStatus;
import com.tellme.enums.SprintStatus;
import com.tellme.repository.ActivityLogRepository;
import com.tellme.repository.IssueRepository;
import com.tellme.repository.SprintRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class SprintService {

    @Autowired
    private SprintRepository sprintRepository;

    @Autowired
    private IssueRepository issueRepository;

    @Autowired
    private ActivityLogRepository activityLogRepository;

    @Autowired
    private ProjectService projectService;

    @Autowired
    private AuthService authService;

    @Transactional(readOnly = true)
    public List<SprintResponse> getProjectSprints(Long projectId) {
        User currentUser = authService.getCurrentUserEntity();
        Project project = projectService.getProjectWithAccessCheck(projectId, currentUser);

        return sprintRepository.findByProjectOrderByCreatedAtDesc(project)
                .stream()
                .map(SprintResponse::fromSprint)
                .collect(Collectors.toList());
    }

    @Transactional
    public SprintResponse createSprint(Long projectId, SprintRequest request) {
        User currentUser = authService.getCurrentUserEntity();
        Project project = projectService.getProjectWithAccessCheck(projectId, currentUser);

        Sprint sprint = Sprint.builder()
                .project(project)
                .name(request.getName())
                .goal(request.getGoal())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .status(SprintStatus.PLANNING)
                .build();

        sprint = sprintRepository.save(sprint);
        return SprintResponse.fromSprint(sprint);
    }

    @Transactional
    public SprintResponse updateSprint(Long sprintId, SprintRequest request) {
        User currentUser = authService.getCurrentUserEntity();
        Sprint sprint = getSprintWithAccessCheck(sprintId, currentUser);

        sprint.setName(request.getName());
        sprint.setGoal(request.getGoal());
        sprint.setStartDate(request.getStartDate());
        sprint.setEndDate(request.getEndDate());

        sprint = sprintRepository.save(sprint);
        return SprintResponse.fromSprint(sprint);
    }

    @Transactional
    public void deleteSprint(Long sprintId) {
        User currentUser = authService.getCurrentUserEntity();
        Sprint sprint = getSprintWithAccessCheck(sprintId, currentUser);

        if (sprint.getStatus() == SprintStatus.ACTIVE) {
            throw new RuntimeException("Cannot delete an active sprint");
        }

        sprintRepository.delete(sprint);
    }

    @Transactional
    public SprintResponse startSprint(Long sprintId) {
        User currentUser = authService.getCurrentUserEntity();
        Sprint sprint = getSprintWithAccessCheck(sprintId, currentUser);

        if (sprint.getStatus() != SprintStatus.PLANNING) {
            throw new RuntimeException("Only sprints in PLANNING status can be started");
        }

        // Check if there's already an active sprint in this project
        Optional<Sprint> activeSprint = sprintRepository
                .findByProjectAndStatus(sprint.getProject(), SprintStatus.ACTIVE)
                .stream()
                .findFirst();

        if (activeSprint.isPresent()) {
            throw new RuntimeException("There is already an active sprint in this project. Complete it first.");
        }

        sprint.setStatus(SprintStatus.ACTIVE);
        sprint = sprintRepository.save(sprint);
        return SprintResponse.fromSprint(sprint);
    }

    @Transactional
    public SprintResponse completeSprint(Long sprintId) {
        User currentUser = authService.getCurrentUserEntity();
        Sprint sprint = getSprintWithAccessCheck(sprintId, currentUser);

        if (sprint.getStatus() != SprintStatus.ACTIVE) {
            throw new RuntimeException("Only active sprints can be completed");
        }

        sprint.setStatus(SprintStatus.COMPLETED);
        sprint = sprintRepository.save(sprint);
        return SprintResponse.fromSprint(sprint);
    }

    @Transactional(readOnly = true)
    public List<BurndownPoint> getBurndownData(Long sprintId) {
        User currentUser = authService.getCurrentUserEntity();
        Sprint sprint = getSprintWithAccessCheck(sprintId, currentUser);

        List<Issue> sprintIssues = issueRepository.findByProjectAndSprintOrderByPositionAsc(sprint.getProject(), sprint);
        int total = sprintIssues.size();
        if (total == 0) return new ArrayList<>();

        // Build map: issueId → date when it was first moved to DONE
        List<ActivityLog> statusLogs = activityLogRepository.findStatusChangesBySprintOrderByCreatedAt(sprint);
        Map<Long, LocalDate> doneDate = new HashMap<>();
        for (ActivityLog log : statusLogs) {
            if ("DONE".equals(log.getNewValue())) {
                doneDate.putIfAbsent(log.getIssue().getId(), log.getCreatedAt().toLocalDate());
            } else if (doneDate.containsKey(log.getIssue().getId())) {
                // Issue was re-opened after DONE → remove from done map
                doneDate.remove(log.getIssue().getId());
            }
        }

        // Determine date range
        LocalDate start = sprint.getStartDate() != null ? sprint.getStartDate() : sprint.getCreatedAt().toLocalDate();
        LocalDate end   = sprint.getEndDate()   != null ? sprint.getEndDate()   : LocalDate.now();
        LocalDate today = LocalDate.now();
        if (end.isAfter(today)) end = today;

        long totalDays = java.time.temporal.ChronoUnit.DAYS.between(start, end);
        if (totalDays < 0) totalDays = 0;

        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        List<BurndownPoint> points = new ArrayList<>();

        for (long i = 0; i <= totalDays; i++) {
            LocalDate day = start.plusDays(i);
            final LocalDate d = day;

            // Issues completed on or before this day
            long completedByDay = doneDate.values().stream()
                    .filter(date -> !date.isAfter(d))
                    .count();

            int remaining = total - (int) completedByDay;
            int ideal = (int) Math.round(total - (total * (double) i / Math.max(totalDays, 1)));

            points.add(new BurndownPoint(d.format(fmt), remaining, ideal, (int) completedByDay));
        }

        return points;
    }

    // Helper method
    public Sprint getSprintWithAccessCheck(Long sprintId, User user) {
        Sprint sprint = sprintRepository.findById(sprintId)
                .orElseThrow(() -> new RuntimeException("Sprint not found with id: " + sprintId));

        projectService.getProjectWithAccessCheck(sprint.getProject().getId(), user);
        return sprint;
    }
}
