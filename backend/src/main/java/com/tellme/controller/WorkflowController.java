package com.tellme.controller;

import com.tellme.dto.request.*;
import com.tellme.dto.response.*;
import com.tellme.service.WorkflowService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/workflows")
public class WorkflowController {

    @Autowired
    private WorkflowService workflowService;

    // ═══════════════════════════════════════════════════════════
    //  WORKFLOW CRUD
    // ═══════════════════════════════════════════════════════════

    @GetMapping
    public ResponseEntity<List<WorkflowResponse>> listAll() {
        return ResponseEntity.ok(workflowService.listAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<WorkflowResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(workflowService.getById(id));
    }

    @PostMapping
    public ResponseEntity<WorkflowResponse> create(@Valid @RequestBody WorkflowRequest req) {
        return ResponseEntity.ok(workflowService.create(req));
    }

    @PutMapping("/{id}")
    public ResponseEntity<WorkflowResponse> update(@PathVariable Long id,
                                                    @RequestBody WorkflowRequest req) {
        return ResponseEntity.ok(workflowService.update(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        workflowService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // ═══════════════════════════════════════════════════════════
    //  STEPS
    // ═══════════════════════════════════════════════════════════

    @PostMapping("/{workflowId}/steps")
    public ResponseEntity<WorkflowStepResponse> addStep(@PathVariable Long workflowId,
                                                         @Valid @RequestBody WorkflowStepRequest req) {
        return ResponseEntity.ok(workflowService.addStep(workflowId, req));
    }

    @PutMapping("/{workflowId}/steps/{stepId}")
    public ResponseEntity<WorkflowStepResponse> updateStep(@PathVariable Long workflowId,
                                                            @PathVariable Long stepId,
                                                            @RequestBody WorkflowStepRequest req) {
        return ResponseEntity.ok(workflowService.updateStep(workflowId, stepId, req));
    }

    @DeleteMapping("/{workflowId}/steps/{stepId}")
    public ResponseEntity<Void> deleteStep(@PathVariable Long workflowId,
                                            @PathVariable Long stepId) {
        workflowService.deleteStep(workflowId, stepId);
        return ResponseEntity.noContent().build();
    }

    // ═══════════════════════════════════════════════════════════
    //  TRANSITIONS
    // ═══════════════════════════════════════════════════════════

    @PostMapping("/{workflowId}/transitions")
    public ResponseEntity<WorkflowTransitionResponse> addTransition(@PathVariable Long workflowId,
                                                                      @Valid @RequestBody WorkflowTransitionRequest req) {
        return ResponseEntity.ok(workflowService.addTransition(workflowId, req));
    }

    @PutMapping("/{workflowId}/transitions/{transitionId}")
    public ResponseEntity<WorkflowTransitionResponse> updateTransition(@PathVariable Long workflowId,
                                                                        @PathVariable Long transitionId,
                                                                        @RequestBody WorkflowTransitionRequest req) {
        return ResponseEntity.ok(workflowService.updateTransition(workflowId, transitionId, req));
    }

    @DeleteMapping("/{workflowId}/transitions/{transitionId}")
    public ResponseEntity<Void> deleteTransition(@PathVariable Long workflowId,
                                                  @PathVariable Long transitionId) {
        workflowService.deleteTransition(workflowId, transitionId);
        return ResponseEntity.noContent().build();
    }

    // ═══════════════════════════════════════════════════════════
    //  ISSUE TRANSITIONS
    // ═══════════════════════════════════════════════════════════

    /** GET /api/workflows/issues/{issueId}/transitions — available transitions for current user */
    @GetMapping("/issues/{issueId}/transitions")
    public ResponseEntity<List<WorkflowTransitionResponse>> getAvailableTransitions(@PathVariable Long issueId) {
        return ResponseEntity.ok(workflowService.getAvailableTransitions(issueId));
    }

    /** POST /api/workflows/issues/{issueId}/transition — execute a transition */
    @PostMapping("/issues/{issueId}/transition")
    public ResponseEntity<?> executeTransition(@PathVariable Long issueId,
                                                @RequestBody IssueTransitionRequest req) {
        return ResponseEntity.ok(workflowService.executeTransition(issueId, req));
    }

    /** GET /api/workflows/issues/{issueId}/approvals — approval history for an issue */
    @GetMapping("/issues/{issueId}/approvals")
    public ResponseEntity<List<WorkflowApprovalResponse>> getIssueApprovals(@PathVariable Long issueId) {
        return ResponseEntity.ok(workflowService.getIssueApprovals(issueId));
    }

    // ═══════════════════════════════════════════════════════════
    //  APPROVALS
    // ═══════════════════════════════════════════════════════════

    /** GET /api/workflows/approvals/pending — my pending approvals */
    @GetMapping("/approvals/pending")
    public ResponseEntity<List<WorkflowApprovalResponse>> getMyPendingApprovals() {
        return ResponseEntity.ok(workflowService.getMyPendingApprovals());
    }

    /** POST /api/workflows/approvals/{id}/approve */
    @PostMapping("/approvals/{id}/approve")
    public ResponseEntity<WorkflowApprovalResponse> approve(@PathVariable Long id,
                                                             @RequestBody ApprovalDecisionRequest req) {
        return ResponseEntity.ok(workflowService.approve(id, req));
    }

    /** POST /api/workflows/approvals/{id}/reject */
    @PostMapping("/approvals/{id}/reject")
    public ResponseEntity<WorkflowApprovalResponse> reject(@PathVariable Long id,
                                                            @RequestBody ApprovalDecisionRequest req) {
        return ResponseEntity.ok(workflowService.reject(id, req));
    }
}
