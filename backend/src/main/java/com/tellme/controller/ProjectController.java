package com.tellme.controller;

import com.tellme.dto.request.AddMemberRequest;
import com.tellme.dto.request.ProjectRequest;
import com.tellme.dto.response.MemberResponse;
import com.tellme.dto.response.ProjectResponse;
import com.tellme.dto.response.UserResponse;
import com.tellme.service.ProjectService;
import com.tellme.service.WorkflowService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    @Autowired
    private ProjectService projectService;

    @Autowired
    private WorkflowService workflowService;

    @GetMapping
    public ResponseEntity<List<ProjectResponse>> getUserProjects() {
        List<ProjectResponse> projects = projectService.getUserProjects();
        return ResponseEntity.ok(projects);
    }

    @PostMapping
    public ResponseEntity<ProjectResponse> createProject(@Valid @RequestBody ProjectRequest request) {
        ProjectResponse project = projectService.createProject(request);
        return ResponseEntity.ok(project);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjectResponse> getProjectById(@PathVariable Long id) {
        ProjectResponse project = projectService.getProjectById(id);
        return ResponseEntity.ok(project);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProjectResponse> updateProject(@PathVariable Long id,
                                                          @RequestBody ProjectRequest request) {
        ProjectResponse project = projectService.updateProject(id, request);
        return ResponseEntity.ok(project);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(@PathVariable Long id) {
        projectService.deleteProject(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/members")
    public ResponseEntity<List<UserResponse>> getProjectMembers(@PathVariable Long id) {
        return ResponseEntity.ok(projectService.getProjectMembers(id));
    }

    @PostMapping("/{id}/members")
    public ResponseEntity<MemberResponse> addMember(
            @PathVariable Long id,
            @Valid @RequestBody AddMemberRequest request) {
        return ResponseEntity.ok(projectService.addMember(id, request));
    }

    @PutMapping("/{id}/members/{userId}")
    public ResponseEntity<MemberResponse> updateMemberRole(
            @PathVariable Long id,
            @PathVariable Long userId,
            @Valid @RequestBody AddMemberRequest request) {
        return ResponseEntity.ok(projectService.updateMemberRole(id, userId, request.getRole()));
    }

    @DeleteMapping("/{id}/members/{userId}")
    public ResponseEntity<Void> removeMember(
            @PathVariable Long id,
            @PathVariable Long userId) {
        projectService.removeMember(id, userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/roles")
    public ResponseEntity<List<MemberResponse>> getProjectRoles(@PathVariable Long id) {
        return ResponseEntity.ok(projectService.getProjectRoles(id));
    }

    /** PUT /api/projects/{id}/workflow?workflowId=123  (pass null / omit to detach) */
    @PutMapping("/{id}/workflow")
    public ResponseEntity<Void> assignWorkflow(@PathVariable Long id,
                                               @RequestParam(required = false) Long workflowId) {
        workflowService.assignWorkflow(id, workflowId);
        return ResponseEntity.noContent().build();
    }
}
