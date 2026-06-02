package com.tellme.service;

import com.tellme.dto.request.SprintRequest;
import com.tellme.dto.response.SprintResponse;
import com.tellme.entity.Project;
import com.tellme.entity.Sprint;
import com.tellme.entity.User;
import com.tellme.enums.SprintStatus;
import com.tellme.repository.SprintRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class SprintService {

    @Autowired
    private SprintRepository sprintRepository;

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

    // Helper method
    public Sprint getSprintWithAccessCheck(Long sprintId, User user) {
        Sprint sprint = sprintRepository.findById(sprintId)
                .orElseThrow(() -> new RuntimeException("Sprint not found with id: " + sprintId));

        projectService.getProjectWithAccessCheck(sprint.getProject().getId(), user);
        return sprint;
    }
}
