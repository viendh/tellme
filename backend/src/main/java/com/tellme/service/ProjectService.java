package com.tellme.service;

import com.tellme.dto.request.AddMemberRequest;
import com.tellme.dto.request.ProjectRequest;
import com.tellme.dto.response.MemberResponse;
import com.tellme.dto.response.ProjectResponse;
import com.tellme.dto.response.UserResponse;
import com.tellme.entity.Issue;
import com.tellme.entity.Project;
import com.tellme.entity.ProjectMember;
import com.tellme.entity.User;
import com.tellme.enums.ApprovalStatus;
import com.tellme.enums.BoardType;
import com.tellme.enums.EstimationType;
import com.tellme.enums.MemberRole;
import com.tellme.enums.ProjectStatus;
import com.tellme.enums.ProjectType;
import com.tellme.enums.ProjectVisibility;
import com.tellme.repository.ActivityLogRepository;
import com.tellme.repository.AttachmentRepository;
import com.tellme.repository.CommentRepository;
import com.tellme.repository.IssueRepository;
import com.tellme.repository.ProjectMemberRepository;
import com.tellme.repository.ProjectRepository;
import com.tellme.repository.SprintRepository;
import com.tellme.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class ProjectService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private ProjectMemberRepository projectMemberRepository;

    @Autowired
    private IssueRepository issueRepository;

    @Autowired
    private ActivityLogRepository activityLogRepository;

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private AttachmentRepository attachmentRepository;

    @Autowired
    private SprintRepository sprintRepository;

    @Autowired
    private AuthService authService;

    @Transactional(readOnly = true)
    public List<ProjectResponse> getUserProjects() {
        User currentUser = authService.getCurrentUserEntity();
        List<Project> projects = projectRepository.findAllUserProjects(currentUser);
        return projects.stream()
                .map(ProjectResponse::fromProject)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProjectResponse createProject(ProjectRequest request) {
        User currentUser = authService.getCurrentUserEntity();

        Project project = Project.builder()
                .name(request.getName())
                .key(request.getKey().toUpperCase())
                .description(request.getDescription())
                .owner(currentUser)
                // Basic
                .status(request.getStatus() != null ? request.getStatus() : ProjectStatus.PLANNING)
                .projectType(request.getProjectType() != null ? request.getProjectType() : ProjectType.SOFTWARE)
                .visibility(request.getVisibility() != null ? request.getVisibility() : ProjectVisibility.PRIVATE)
                .priority(request.getPriority())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .actualEndDate(request.getActualEndDate())
                .progressPercent(request.getProgressPercent())
                // Progress
                .releaseVersion(request.getReleaseVersion())
                .milestone(request.getMilestone())
                .velocity(request.getVelocity())
                .roadmapEnabled(Boolean.TRUE.equals(request.getRoadmapEnabled()))
                .burndownEnabled(Boolean.TRUE.equals(request.getBurndownEnabled()))
                // Agile
                .boardType(request.getBoardType() != null ? request.getBoardType() : BoardType.SCRUM)
                .estimationType(request.getEstimationType() != null ? request.getEstimationType() : EstimationType.STORY_POINT)
                .sprintDurationDays(request.getSprintDurationDays() != null ? request.getSprintDurationDays() : 14)
                .wipLimit(request.getWipLimit())
                .backlogEnabled(request.getBacklogEnabled() == null || request.getBacklogEnabled())
                // Financial
                .budgetAmount(request.getBudgetAmount())
                .plannedCost(request.getPlannedCost())
                .actualCost(request.getActualCost())
                .currencyCode(request.getCurrencyCode() != null ? request.getCurrencyCode() : "VND")
                .capexOpexType(request.getCapexOpexType())
                .contractNo(request.getContractNo())
                // Governance
                .phase(request.getPhase())
                .riskLevel(request.getRiskLevel())
                .approvalStatus(request.getApprovalStatus() != null ? request.getApprovalStatus() : ApprovalStatus.PENDING)
                // DevOps
                .gitRepositoryUrl(request.getGitRepositoryUrl())
                .ciPipelineUrl(request.getCiPipelineUrl())
                .deploymentEnv(request.getDeploymentEnv())
                .releaseTag(request.getReleaseTag())
                .testCoverage(request.getTestCoverage())
                .build();

        project = projectRepository.save(project);

        // Add owner as OWNER member
        ProjectMember ownerMember = ProjectMember.builder()
                .project(project)
                .user(currentUser)
                .role(MemberRole.OWNER)
                .build();

        projectMemberRepository.save(ownerMember);

        // Add initial members if provided
        if (request.getMembers() != null) {
            for (AddMemberRequest memberReq : request.getMembers()) {
                if (memberReq.getUserId().equals(currentUser.getId())) continue;
                final Project finalProject = project;
                userRepository.findById(memberReq.getUserId()).ifPresent(memberUser -> {
                    ProjectMember pm = ProjectMember.builder()
                            .project(finalProject)
                            .user(memberUser)
                            .role(memberReq.getRole() != null ? memberReq.getRole() : MemberRole.DEVELOPER)
                            .build();
                    projectMemberRepository.save(pm);
                });
            }
        }

        project = projectRepository.findById(project.getId())
                .orElseThrow(() -> new RuntimeException("Project not found"));

        return ProjectResponse.fromProject(project);
    }

    @Transactional(readOnly = true)
    public ProjectResponse getProjectById(Long id) {
        User currentUser = authService.getCurrentUserEntity();
        Project project = getProjectWithAccessCheck(id, currentUser);
        return ProjectResponse.fromProject(project);
    }

    @Transactional
    public ProjectResponse updateProject(Long id, ProjectRequest request) {
        User currentUser = authService.getCurrentUserEntity();
        Project project = getProjectWithAccessCheck(id, currentUser);
        checkAdminAccess(project, currentUser);

        // Required
        project.setName(request.getName());

        // Basic – nullable fields patched when non-null
        if (request.getDescription() != null) project.setDescription(request.getDescription());
        if (request.getStatus() != null) project.setStatus(request.getStatus());
        if (request.getProjectType() != null) project.setProjectType(request.getProjectType());
        if (request.getVisibility() != null) project.setVisibility(request.getVisibility());
        if (request.getPriority() != null) project.setPriority(request.getPriority());
        if (request.getStartDate() != null) project.setStartDate(request.getStartDate());
        if (request.getEndDate() != null) project.setEndDate(request.getEndDate());
        if (request.getActualEndDate() != null) project.setActualEndDate(request.getActualEndDate());
        if (request.getProgressPercent() != null) project.setProgressPercent(request.getProgressPercent());

        // Progress
        if (request.getReleaseVersion() != null) project.setReleaseVersion(request.getReleaseVersion());
        if (request.getMilestone() != null) project.setMilestone(request.getMilestone());
        if (request.getVelocity() != null) project.setVelocity(request.getVelocity());
        if (request.getRoadmapEnabled() != null) project.setRoadmapEnabled(request.getRoadmapEnabled());
        if (request.getBurndownEnabled() != null) project.setBurndownEnabled(request.getBurndownEnabled());

        // Agile
        if (request.getBoardType() != null) project.setBoardType(request.getBoardType());
        if (request.getEstimationType() != null) project.setEstimationType(request.getEstimationType());
        if (request.getSprintDurationDays() != null) project.setSprintDurationDays(request.getSprintDurationDays());
        if (request.getWipLimit() != null) project.setWipLimit(request.getWipLimit());
        if (request.getBacklogEnabled() != null) project.setBacklogEnabled(request.getBacklogEnabled());

        // Financial
        if (request.getBudgetAmount() != null) project.setBudgetAmount(request.getBudgetAmount());
        if (request.getPlannedCost() != null) project.setPlannedCost(request.getPlannedCost());
        if (request.getActualCost() != null) project.setActualCost(request.getActualCost());
        if (request.getCurrencyCode() != null) project.setCurrencyCode(request.getCurrencyCode());
        if (request.getCapexOpexType() != null) project.setCapexOpexType(request.getCapexOpexType());
        if (request.getContractNo() != null) project.setContractNo(request.getContractNo());

        // Governance
        if (request.getPhase() != null) project.setPhase(request.getPhase());
        if (request.getRiskLevel() != null) project.setRiskLevel(request.getRiskLevel());
        if (request.getApprovalStatus() != null) project.setApprovalStatus(request.getApprovalStatus());

        // DevOps
        if (request.getGitRepositoryUrl() != null) project.setGitRepositoryUrl(request.getGitRepositoryUrl());
        if (request.getCiPipelineUrl() != null) project.setCiPipelineUrl(request.getCiPipelineUrl());
        if (request.getDeploymentEnv() != null) project.setDeploymentEnv(request.getDeploymentEnv());
        if (request.getReleaseTag() != null) project.setReleaseTag(request.getReleaseTag());
        if (request.getTestCoverage() != null) project.setTestCoverage(request.getTestCoverage());

        project = projectRepository.save(project);
        return ProjectResponse.fromProject(project);
    }

    @Transactional
    public void deleteProject(Long id) {
        User currentUser = authService.getCurrentUserEntity();
        Project project = getProjectWithAccessCheck(id, currentUser);

        if (!project.getOwner().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Only the project owner can delete this project");
        }

        // Delete all issues recursively (handles subtasks, activity logs, comments, attachments)
        List<Issue> rootIssues = issueRepository.findByProjectAndParentIssueIsNullOrderByCreatedAtAsc(project);
        for (Issue issue : rootIssues) {
            deleteIssueRecursive(issue);
        }

        // Delete sprints (project_members cascade via CascadeType.ALL on Project entity)
        sprintRepository.deleteByProject(project);

        projectRepository.delete(project);
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

    @Transactional(readOnly = true)
    public List<UserResponse> getProjectMembers(Long id) {
        User currentUser = authService.getCurrentUserEntity();
        getProjectWithAccessCheck(id, currentUser);
        return userRepository.findByIsApprovedTrueAndIsActiveTrueOrderByFullNameAsc()
                .stream()
                .map(UserResponse::fromUser)
                .collect(Collectors.toList());
    }

    public Project getProjectWithAccessCheck(Long projectId, User user) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + projectId));

        boolean isOwner = project.getOwner().getId().equals(user.getId());
        boolean isMember = projectMemberRepository.existsByProjectAndUser(project, user);

        if (!isOwner && !isMember) {
            throw new RuntimeException("Access denied: you are not a member of this project");
        }

        return project;
    }

    private void checkAdminAccess(Project project, User user) {
        if (project.getOwner().getId().equals(user.getId())) return;

        ProjectMember member = projectMemberRepository.findByProjectAndUser(project, user)
                .orElseThrow(() -> new RuntimeException("You are not a member of this project"));

        if (member.getRole() != MemberRole.OWNER && member.getRole() != MemberRole.MANAGER) {
            throw new RuntimeException("You need manager or owner role to perform this action");
        }
    }

    @Transactional
    public MemberResponse addMember(Long projectId, AddMemberRequest request) {
        User currentUser = authService.getCurrentUserEntity();
        Project project = getProjectWithAccessCheck(projectId, currentUser);

        ProjectMember currentMember = projectMemberRepository
                .findByProjectAndUser(project, currentUser)
                .orElseThrow(() -> new RuntimeException("Access denied"));
        if (currentMember.getRole() != MemberRole.OWNER && currentMember.getRole() != MemberRole.MANAGER) {
            throw new RuntimeException("Access denied: only OWNER or MANAGER can add members");
        }

        User newUser = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (projectMemberRepository.findByProjectAndUser(project, newUser).isPresent()) {
            throw new RuntimeException("User is already a member of this project");
        }

        ProjectMember member = ProjectMember.builder()
                .project(project)
                .user(newUser)
                .role(request.getRole())
                .build();

        return MemberResponse.fromMember(projectMemberRepository.save(member));
    }

    @Transactional
    public MemberResponse updateMemberRole(Long projectId, Long userId, MemberRole newRole) {
        Objects.requireNonNull(userId, "userId must not be null");
        User currentUser = authService.getCurrentUserEntity();
        Project project = getProjectWithAccessCheck(projectId, currentUser);

        ProjectMember currentMember = projectMemberRepository
                .findByProjectAndUser(project, currentUser)
                .orElseThrow(() -> new RuntimeException("Access denied"));
        if (currentMember.getRole() != MemberRole.OWNER && currentMember.getRole() != MemberRole.MANAGER) {
            throw new RuntimeException("Access denied: only OWNER or MANAGER can update roles");
        }

        User targetUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        ProjectMember member = projectMemberRepository.findByProjectAndUser(project, targetUser)
                .orElseThrow(() -> new RuntimeException("User is not a member of this project"));

        if (member.getRole() == MemberRole.OWNER) {
            throw new RuntimeException("Cannot change the role of project owner");
        }

        member.setRole(newRole);
        return MemberResponse.fromMember(projectMemberRepository.save(member));
    }

    @Transactional
    public void removeMember(Long projectId, Long userId) {
        Objects.requireNonNull(userId, "userId must not be null");
        User currentUser = authService.getCurrentUserEntity();
        Project project = getProjectWithAccessCheck(projectId, currentUser);

        ProjectMember currentMember = projectMemberRepository
                .findByProjectAndUser(project, currentUser)
                .orElseThrow(() -> new RuntimeException("Access denied"));
        if (currentMember.getRole() != MemberRole.OWNER && currentMember.getRole() != MemberRole.MANAGER) {
            throw new RuntimeException("Access denied: only OWNER or MANAGER can remove members");
        }

        User targetUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        ProjectMember member = projectMemberRepository.findByProjectAndUser(project, targetUser)
                .orElseThrow(() -> new RuntimeException("User is not a member of this project"));

        if (member.getRole() == MemberRole.OWNER) {
            throw new RuntimeException("Cannot remove project owner");
        }

        projectMemberRepository.delete(member);
    }

    @Transactional(readOnly = true)
    public List<MemberResponse> getProjectRoles(Long projectId) {
        User currentUser = authService.getCurrentUserEntity();
        Project project = getProjectWithAccessCheck(projectId, currentUser);
        return project.getMembers().stream()
                .map(MemberResponse::fromMember)
                .collect(Collectors.toList());
    }
}
