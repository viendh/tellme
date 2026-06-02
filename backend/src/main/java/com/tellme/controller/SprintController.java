package com.tellme.controller;

import com.tellme.dto.request.SprintRequest;
import com.tellme.dto.response.SprintResponse;
import com.tellme.service.SprintService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api")
public class SprintController {

    @Autowired
    private SprintService sprintService;

    @GetMapping("/projects/{projectId}/sprints")
    public ResponseEntity<List<SprintResponse>> getProjectSprints(@PathVariable Long projectId) {
        List<SprintResponse> sprints = sprintService.getProjectSprints(projectId);
        return ResponseEntity.ok(sprints);
    }

    @PostMapping("/projects/{projectId}/sprints")
    public ResponseEntity<SprintResponse> createSprint(@PathVariable Long projectId,
                                                        @Valid @RequestBody SprintRequest request) {
        SprintResponse sprint = sprintService.createSprint(projectId, request);
        return ResponseEntity.ok(sprint);
    }

    @PutMapping("/sprints/{id}")
    public ResponseEntity<SprintResponse> updateSprint(@PathVariable Long id,
                                                        @Valid @RequestBody SprintRequest request) {
        SprintResponse sprint = sprintService.updateSprint(id, request);
        return ResponseEntity.ok(sprint);
    }

    @DeleteMapping("/sprints/{id}")
    public ResponseEntity<Void> deleteSprint(@PathVariable Long id) {
        sprintService.deleteSprint(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/sprints/{id}/start")
    public ResponseEntity<SprintResponse> startSprint(@PathVariable Long id) {
        SprintResponse sprint = sprintService.startSprint(id);
        return ResponseEntity.ok(sprint);
    }

    @PostMapping("/sprints/{id}/complete")
    public ResponseEntity<SprintResponse> completeSprint(@PathVariable Long id) {
        SprintResponse sprint = sprintService.completeSprint(id);
        return ResponseEntity.ok(sprint);
    }
}
