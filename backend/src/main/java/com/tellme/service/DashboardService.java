package com.tellme.service;

import com.tellme.dto.response.ActivityLogResponse;
import com.tellme.dto.response.IssueResponse;
import com.tellme.dto.response.ProjectDashboardResponse;
import com.tellme.dto.response.UserDashboardResponse;
import com.tellme.dto.response.UserResponse;
import com.tellme.entity.Issue;
import com.tellme.entity.Project;
import com.tellme.entity.Sprint;
import com.tellme.entity.User;
import com.tellme.enums.IssueStatus;
import com.tellme.enums.IssueType;
import com.tellme.enums.IssuePriority;
import com.tellme.enums.SprintStatus;
import com.tellme.repository.ActivityLogRepository;
import com.tellme.repository.IssueRepository;
import com.tellme.repository.ProjectRepository;
import com.tellme.repository.SprintRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    @Autowired private IssueRepository issueRepository;
    @Autowired private ProjectRepository projectRepository;
    @Autowired private SprintRepository sprintRepository;
    @Autowired private ActivityLogRepository activityLogRepository;
    @Autowired private AuthService authService;
    @Autowired private ProjectService projectService;

    @Transactional(readOnly = true)
    public UserDashboardResponse getUserDashboard() {
        User currentUser = authService.getCurrentUserEntity();
        List<Project> projects = projectRepository.findAllUserProjects(currentUser);

        UserDashboardResponse resp = new UserDashboardResponse();
        resp.setTotalProjects(projects.size());
        resp.setTotalAssigned(issueRepository.countByAssignee(currentUser));
        resp.setTodoCount(issueRepository.countByAssigneeAndStatus(currentUser, IssueStatus.TODO));
        resp.setInProgressCount(issueRepository.countByAssigneeAndStatus(currentUser, IssueStatus.IN_PROGRESS));
        resp.setTestingCount(issueRepository.countByAssigneeAndStatus(currentUser, IssueStatus.TESTING));
        resp.setDoneCount(issueRepository.countByAssigneeAndStatus(currentUser, IssueStatus.DONE));
        resp.setOverdueCount(issueRepository.countByAssigneeAndDueDateBeforeAndStatusNot(
                currentUser, LocalDateTime.now(), IssueStatus.DONE));
        resp.setRecentIssues(issueRepository.findTop5ByAssigneeOrderByUpdatedAtDesc(currentUser)
                .stream().map(IssueResponse::fromIssue).collect(Collectors.toList()));
        return resp;
    }

    @Transactional(readOnly = true)
    public ProjectDashboardResponse getProjectDashboard(Long projectId) {
        User currentUser = authService.getCurrentUserEntity();
        Project project = projectService.getProjectWithAccessCheck(projectId, currentUser);
        List<Issue> allIssues = issueRepository.findByProjectOrderByPositionAsc(project);

        ProjectDashboardResponse resp = new ProjectDashboardResponse();
        resp.setTotalIssues(allIssues.size());

        resp.setTodoCount(allIssues.stream().filter(i -> i.getStatus() == IssueStatus.TODO).count());
        resp.setInProgressCount(allIssues.stream().filter(i -> i.getStatus() == IssueStatus.IN_PROGRESS).count());
        resp.setTestingCount(allIssues.stream().filter(i -> i.getStatus() == IssueStatus.TESTING).count());
        resp.setUatCount(allIssues.stream().filter(i -> i.getStatus() == IssueStatus.UAT).count());
        resp.setDoneCount(allIssues.stream().filter(i -> i.getStatus() == IssueStatus.DONE).count());

        resp.setBugCount(allIssues.stream().filter(i -> i.getType() == IssueType.BUG).count());
        resp.setTaskCount(allIssues.stream().filter(i -> i.getType() == IssueType.TASK).count());
        resp.setStoryCount(allIssues.stream().filter(i -> i.getType() == IssueType.STORY).count());
        resp.setEpicCount(allIssues.stream().filter(i -> i.getType() == IssueType.EPIC).count());

        resp.setLowCount(allIssues.stream().filter(i -> i.getPriority() == IssuePriority.LOW).count());
        resp.setMediumCount(allIssues.stream().filter(i -> i.getPriority() == IssuePriority.MEDIUM).count());
        resp.setHighCount(allIssues.stream().filter(i -> i.getPriority() == IssuePriority.HIGH).count());
        resp.setCriticalCount(allIssues.stream().filter(i -> i.getPriority() == IssuePriority.CRITICAL).count());

        List<Sprint> activeSprints = sprintRepository.findByProjectAndStatus(project, SprintStatus.ACTIVE);
        if (!activeSprints.isEmpty()) {
            Sprint sprint = activeSprints.get(0);
            List<Issue> sprintIssues = issueRepository.findByProjectAndSprintOrderByPositionAsc(project, sprint);
            ProjectDashboardResponse.SprintSummary ss = new ProjectDashboardResponse.SprintSummary();
            ss.setId(sprint.getId());
            ss.setName(sprint.getName());
            ss.setGoal(sprint.getGoal());
            ss.setStartDate(sprint.getStartDate() != null ? sprint.getStartDate().toString() : null);
            ss.setEndDate(sprint.getEndDate() != null ? sprint.getEndDate().toString() : null);
            ss.setTotalIssues(sprintIssues.size());
            ss.setDoneIssues(sprintIssues.stream().filter(i -> i.getStatus() == IssueStatus.DONE).count());
            ss.setInProgressIssues(sprintIssues.stream().filter(i -> i.getStatus() == IssueStatus.IN_PROGRESS).count());
            resp.setActiveSprint(ss);
        }

        Map<User, List<Issue>> byAssignee = allIssues.stream()
                .filter(i -> i.getAssignee() != null)
                .collect(Collectors.groupingBy(Issue::getAssignee));
        List<ProjectDashboardResponse.MemberWorkload> workload = byAssignee.entrySet().stream()
                .map(e -> {
                    ProjectDashboardResponse.MemberWorkload mw = new ProjectDashboardResponse.MemberWorkload();
                    mw.setUser(UserResponse.fromUser(e.getKey()));
                    mw.setTotalIssues(e.getValue().size());
                    mw.setInProgressIssues(e.getValue().stream().filter(i -> i.getStatus() == IssueStatus.IN_PROGRESS).count());
                    mw.setDoneIssues(e.getValue().stream().filter(i -> i.getStatus() == IssueStatus.DONE).count());
                    return mw;
                })
                .sorted(Comparator.comparingLong(ProjectDashboardResponse.MemberWorkload::getTotalIssues).reversed())
                .collect(Collectors.toList());
        resp.setMemberWorkload(workload);

        resp.setRecentActivity(activityLogRepository.findTop10ByIssueProjectOrderByCreatedAtDesc(project)
                .stream().map(ActivityLogResponse::fromActivityLog).collect(Collectors.toList()));

        return resp;
    }
}
