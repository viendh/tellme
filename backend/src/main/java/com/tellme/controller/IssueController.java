package com.tellme.controller;

import com.tellme.dto.request.IssueRequest;
import com.tellme.dto.request.IssueSprintRequest;
import com.tellme.dto.request.IssueStatusRequest;
import com.tellme.dto.response.ActivityLogResponse;
import com.tellme.dto.response.IssueResponse;
import com.tellme.service.IssueService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class IssueController {

    @Autowired
    private IssueService issueService;

    @GetMapping("/projects/{projectId}/issues")
    public ResponseEntity<List<IssueResponse>> getProjectIssues(
            @PathVariable Long projectId,
            @RequestParam(required = false) String sprintId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long assigneeId) {
        List<IssueResponse> issues = issueService.getProjectIssues(projectId, sprintId, status, assigneeId);
        return ResponseEntity.ok(issues);
    }

    @PostMapping("/projects/{projectId}/issues")
    public ResponseEntity<IssueResponse> createIssue(@PathVariable Long projectId,
                                                       @Valid @RequestBody IssueRequest request) {
        IssueResponse issue = issueService.createIssue(projectId, request);
        return ResponseEntity.ok(issue);
    }

    @GetMapping("/issues/{id}")
    public ResponseEntity<IssueResponse> getIssueById(@PathVariable Long id) {
        IssueResponse issue = issueService.getIssueById(id);
        return ResponseEntity.ok(issue);
    }

    @PutMapping("/issues/{id}")
    public ResponseEntity<IssueResponse> updateIssue(@PathVariable Long id,
                                                      @RequestBody IssueRequest request) {
        IssueResponse issue = issueService.updateIssue(id, request);
        return ResponseEntity.ok(issue);
    }

    @DeleteMapping("/issues/{id}")
    public ResponseEntity<Void> deleteIssue(@PathVariable Long id) {
        issueService.deleteIssue(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/issues/{id}/status")
    public ResponseEntity<IssueResponse> updateIssueStatus(@PathVariable Long id,
                                                             @Valid @RequestBody IssueStatusRequest request) {
        IssueResponse issue = issueService.updateIssueStatus(id, request);
        return ResponseEntity.ok(issue);
    }

    @PatchMapping("/issues/{id}/sprint")
    public ResponseEntity<IssueResponse> updateIssueSprint(@PathVariable Long id,
                                                            @RequestBody IssueSprintRequest request) {
        IssueResponse issue = issueService.updateIssueSprint(id, request);
        return ResponseEntity.ok(issue);
    }

    @GetMapping("/issues/{issueId}/activity")
    public ResponseEntity<List<ActivityLogResponse>> getIssueActivity(@PathVariable Long issueId) {
        List<ActivityLogResponse> activity = issueService.getIssueActivity(issueId);
        return ResponseEntity.ok(activity);
    }

    @GetMapping("/issues/my")
    public ResponseEntity<List<IssueResponse>> getMyIssues() {
        return ResponseEntity.ok(issueService.getMyIssues());
    }

    @GetMapping("/issues/{issueId}/subtasks")
    public ResponseEntity<List<IssueResponse>> getSubtasks(@PathVariable Long issueId) {
        return ResponseEntity.ok(issueService.getSubtasks(issueId));
    }

    @PatchMapping("/issues/{id}/assign")
    public ResponseEntity<IssueResponse> assignIssue(
            @PathVariable Long id,
            @RequestBody Map<String, Long> body) {
        Long assigneeId = body.get("assigneeId");
        return ResponseEntity.ok(issueService.assignIssue(id, assigneeId));
    }

    @GetMapping("/issues/search")
    public ResponseEntity<List<IssueResponse>> advancedSearch(
            @RequestParam(required = false) Long projectId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Long assigneeId,
            @RequestParam(required = false) String q) {
        return ResponseEntity.ok(
                issueService.advancedSearch(projectId, status, priority, type, assigneeId, q));
    }
}
