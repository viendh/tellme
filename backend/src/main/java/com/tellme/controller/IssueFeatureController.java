package com.tellme.controller;

import com.tellme.dto.request.*;
import com.tellme.dto.response.*;
import com.tellme.service.IssueFeatureService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class IssueFeatureController {

    @Autowired
    private IssueFeatureService issueFeatureService;

    // ─── Watchers ────────────────────────────────────────────────────────────

    @GetMapping("/issues/{issueId}/watchers")
    public ResponseEntity<Map<String, Object>> getWatchers(@PathVariable Long issueId) {
        return ResponseEntity.ok(issueFeatureService.getWatchStatus(issueId));
    }

    @PostMapping("/issues/{issueId}/watch")
    public ResponseEntity<Map<String, Object>> toggleWatch(@PathVariable Long issueId) {
        return ResponseEntity.ok(issueFeatureService.toggleWatch(issueId));
    }

    // ─── Votes ───────────────────────────────────────────────────────────────

    @PostMapping("/issues/{issueId}/vote")
    public ResponseEntity<Map<String, Object>> toggleVote(@PathVariable Long issueId) {
        return ResponseEntity.ok(issueFeatureService.toggleVote(issueId));
    }

    // ─── Issue Links ─────────────────────────────────────────────────────────

    @GetMapping("/issues/{issueId}/links")
    public ResponseEntity<List<IssueLinkResponse>> getLinks(@PathVariable Long issueId) {
        return ResponseEntity.ok(issueFeatureService.getLinks(issueId));
    }

    @PostMapping("/issues/{issueId}/links")
    public ResponseEntity<IssueLinkResponse> addLink(
            @PathVariable Long issueId,
            @RequestBody IssueLinkRequest request) {
        return ResponseEntity.ok(issueFeatureService.addLink(issueId, request));
    }

    @DeleteMapping("/issue-links/{linkId}")
    public ResponseEntity<Void> deleteLink(@PathVariable Long linkId) {
        issueFeatureService.deleteLink(linkId);
        return ResponseEntity.noContent().build();
    }

    // ─── Worklog ─────────────────────────────────────────────────────────────

    @GetMapping("/issues/{issueId}/worklogs")
    public ResponseEntity<List<WorklogResponse>> getWorklogs(@PathVariable Long issueId) {
        return ResponseEntity.ok(issueFeatureService.getWorklogs(issueId));
    }

    @PostMapping("/issues/{issueId}/worklogs")
    public ResponseEntity<WorklogResponse> addWorklog(
            @PathVariable Long issueId,
            @RequestBody WorklogRequest request) {
        return ResponseEntity.ok(issueFeatureService.addWorklog(issueId, request));
    }

    @PutMapping("/worklogs/{worklogId}")
    public ResponseEntity<WorklogResponse> updateWorklog(
            @PathVariable Long worklogId,
            @RequestBody WorklogRequest request) {
        return ResponseEntity.ok(issueFeatureService.updateWorklog(worklogId, request));
    }

    @DeleteMapping("/worklogs/{worklogId}")
    public ResponseEntity<Void> deleteWorklog(@PathVariable Long worklogId) {
        issueFeatureService.deleteWorklog(worklogId);
        return ResponseEntity.noContent().build();
    }

    // ─── Clone Issue ─────────────────────────────────────────────────────────

    @PostMapping("/issues/{issueId}/clone")
    public ResponseEntity<IssueResponse> cloneIssue(@PathVariable Long issueId) {
        return ResponseEntity.ok(issueFeatureService.cloneIssue(issueId));
    }

    // ─── Move Issue ───────────────────────────────────────────────────────────

    @PostMapping("/issues/{issueId}/move")
    public ResponseEntity<IssueResponse> moveIssue(
            @PathVariable Long issueId,
            @RequestParam Long targetProjectId) {
        return ResponseEntity.ok(issueFeatureService.moveIssue(issueId, targetProjectId));
    }

    // ─── Labels ───────────────────────────────────────────────────────────────

    @PutMapping("/issues/{issueId}/labels")
    public ResponseEntity<IssueResponse> updateLabels(
            @PathVariable Long issueId,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(issueFeatureService.updateLabels(issueId, body.get("labels")));
    }

    // ─── Components ───────────────────────────────────────────────────────────

    @GetMapping("/projects/{projectId}/components")
    public ResponseEntity<List<ComponentResponse>> getComponents(@PathVariable Long projectId) {
        return ResponseEntity.ok(issueFeatureService.getComponents(projectId));
    }

    @PostMapping("/projects/{projectId}/components")
    public ResponseEntity<ComponentResponse> createComponent(
            @PathVariable Long projectId,
            @RequestBody ComponentRequest request) {
        return ResponseEntity.ok(issueFeatureService.createComponent(projectId, request));
    }

    @PutMapping("/components/{componentId}")
    public ResponseEntity<ComponentResponse> updateComponent(
            @PathVariable Long componentId,
            @RequestBody ComponentRequest request) {
        return ResponseEntity.ok(issueFeatureService.updateComponent(componentId, request));
    }

    @DeleteMapping("/components/{componentId}")
    public ResponseEntity<Void> deleteComponent(@PathVariable Long componentId) {
        issueFeatureService.deleteComponent(componentId);
        return ResponseEntity.noContent().build();
    }

    // ─── Versions ────────────────────────────────────────────────────────────

    @GetMapping("/projects/{projectId}/versions")
    public ResponseEntity<List<VersionResponse>> getVersions(@PathVariable Long projectId) {
        return ResponseEntity.ok(issueFeatureService.getVersions(projectId));
    }

    @PostMapping("/projects/{projectId}/versions")
    public ResponseEntity<VersionResponse> createVersion(
            @PathVariable Long projectId,
            @RequestBody VersionRequest request) {
        return ResponseEntity.ok(issueFeatureService.createVersion(projectId, request));
    }

    @PutMapping("/versions/{versionId}")
    public ResponseEntity<VersionResponse> updateVersion(
            @PathVariable Long versionId,
            @RequestBody VersionRequest request) {
        return ResponseEntity.ok(issueFeatureService.updateVersion(versionId, request));
    }

    @DeleteMapping("/versions/{versionId}")
    public ResponseEntity<Void> deleteVersion(@PathVariable Long versionId) {
        issueFeatureService.deleteVersion(versionId);
        return ResponseEntity.noContent().build();
    }

    // ─── Saved Filters ───────────────────────────────────────────────────────

    @GetMapping("/filters")
    public ResponseEntity<List<SavedFilterResponse>> getSavedFilters() {
        return ResponseEntity.ok(issueFeatureService.getSavedFilters());
    }

    @PostMapping("/filters")
    public ResponseEntity<SavedFilterResponse> createSavedFilter(
            @RequestBody SavedFilterRequest request) {
        return ResponseEntity.ok(issueFeatureService.createSavedFilter(request));
    }

    @PutMapping("/filters/{filterId}")
    public ResponseEntity<SavedFilterResponse> updateSavedFilter(
            @PathVariable Long filterId,
            @RequestBody SavedFilterRequest request) {
        return ResponseEntity.ok(issueFeatureService.updateSavedFilter(filterId, request));
    }

    @DeleteMapping("/filters/{filterId}")
    public ResponseEntity<Void> deleteSavedFilter(@PathVariable Long filterId) {
        issueFeatureService.deleteSavedFilter(filterId);
        return ResponseEntity.noContent().build();
    }

    // ─── Reports ─────────────────────────────────────────────────────────────

    @GetMapping("/projects/{projectId}/reports/overdue")
    public ResponseEntity<List<IssueResponse>> getOverdueIssues(@PathVariable Long projectId) {
        return ResponseEntity.ok(issueFeatureService.getOverdueIssues(projectId));
    }

    @GetMapping("/projects/{projectId}/reports/workload")
    public ResponseEntity<List<Map<String, Object>>> getWorkloadReport(@PathVariable Long projectId) {
        return ResponseEntity.ok(issueFeatureService.getWorkloadReport(projectId));
    }

    @GetMapping("/projects/{projectId}/reports/created-vs-resolved")
    public ResponseEntity<Map<String, Object>> getCreatedVsResolvedReport(
            @PathVariable Long projectId,
            @RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(issueFeatureService.getCreatedVsResolvedReport(projectId, days));
    }

    @GetMapping("/projects/{projectId}/reports/resolution-time")
    public ResponseEntity<Map<String, Object>> getResolutionTimeReport(@PathVariable Long projectId) {
        return ResponseEntity.ok(issueFeatureService.getResolutionTimeReport(projectId));
    }
}
