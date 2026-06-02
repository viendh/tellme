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
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class WorkflowService {

    @Autowired private WorkflowRepository workflowRepo;
    @Autowired private WorkflowStepRepository stepRepo;
    @Autowired private WorkflowTransitionRepository transitionRepo;
    @Autowired private WorkflowApprovalRepository approvalRepo;
    @Autowired private ProjectRepository projectRepo;
    @Autowired private IssueRepository issueRepo;
    @Autowired private ProjectMemberRepository memberRepo;
    @Autowired private ActivityLogRepository activityLogRepo;
    @Autowired private AuthService authService;
    @Autowired private EmailService emailService;

    // ═══════════════════════════════════════════════════════════
    //  WORKFLOW CRUD
    // ═══════════════════════════════════════════════════════════

    @Transactional(readOnly = true)
    public List<WorkflowResponse> listAll() {
        return workflowRepo.findAllByOrderByCreatedAtDesc().stream()
                .map(WorkflowResponse::from).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public WorkflowResponse getById(Long id) {
        return WorkflowResponse.from(findWorkflow(id));
    }

    @Transactional
    public WorkflowResponse create(WorkflowRequest req) {
        User me = authService.getCurrentUserEntity();
        if (Boolean.TRUE.equals(req.getIsDefault())) {
            // Bỏ default cũ
            workflowRepo.findByIsDefaultTrue()
                    .ifPresent(w -> { w.setIsDefault(false); workflowRepo.save(w); });
        }
        Workflow w = Workflow.builder()
                .name(req.getName())
                .description(req.getDescription())
                .isDefault(Boolean.TRUE.equals(req.getIsDefault()))
                .createdBy(me)
                .build();
        return WorkflowResponse.from(workflowRepo.save(w));
    }

    @Transactional
    public WorkflowResponse update(Long id, WorkflowRequest req) {
        Workflow w = findWorkflow(id);
        if (req.getName() != null)        w.setName(req.getName());
        if (req.getDescription() != null) w.setDescription(req.getDescription());
        if (Boolean.TRUE.equals(req.getIsDefault())) {
            workflowRepo.findByIsDefaultTrue()
                    .filter(existing -> !existing.getId().equals(id))
                    .ifPresent(existing -> { existing.setIsDefault(false); workflowRepo.save(existing); });
            w.setIsDefault(true);
        } else if (req.getIsDefault() != null) {
            w.setIsDefault(false);
        }
        return WorkflowResponse.from(workflowRepo.save(w));
    }

    @Transactional
    public void delete(Long id) {
        workflowRepo.delete(findWorkflow(id));
    }

    // ═══════════════════════════════════════════════════════════
    //  STEPS
    // ═══════════════════════════════════════════════════════════

    @Transactional
    public WorkflowStepResponse addStep(Long workflowId, WorkflowStepRequest req) {
        Workflow w = findWorkflow(workflowId);
        // Nếu set isInitial=true thì bỏ initial cũ
        if (Boolean.TRUE.equals(req.getIsInitial())) {
            w.getSteps().forEach(s -> { if (Boolean.TRUE.equals(s.getIsInitial())) s.setIsInitial(false); });
        }
        int pos = req.getPosition() != null ? req.getPosition()
                : w.getSteps().stream().mapToInt(WorkflowStep::getPosition).max().orElse(-1) + 1;
        WorkflowStep step = WorkflowStep.builder()
                .workflow(w)
                .name(req.getName())
                .color(req.getColor() != null ? req.getColor() : "#6b7280")
                .position(pos)
                .isInitial(Boolean.TRUE.equals(req.getIsInitial()))
                .isFinal(Boolean.TRUE.equals(req.getIsFinal()))
                .mappedStatus(req.getMappedStatus())
                .build();
        return WorkflowStepResponse.from(stepRepo.save(step));
    }

    @Transactional
    public WorkflowStepResponse updateStep(Long workflowId, Long stepId, WorkflowStepRequest req) {
        WorkflowStep step = findStep(workflowId, stepId);
        if (req.getName() != null)     step.setName(req.getName());
        if (req.getColor() != null)    step.setColor(req.getColor());
        if (req.getPosition() != null) step.setPosition(req.getPosition());
        if (req.getIsInitial() != null) step.setIsInitial(req.getIsInitial());
        if (req.getIsFinal() != null)  step.setIsFinal(req.getIsFinal());
        if (req.getMappedStatus() != null) step.setMappedStatus(req.getMappedStatus());
        return WorkflowStepResponse.from(stepRepo.save(step));
    }

    @Transactional
    public void deleteStep(Long workflowId, Long stepId) {
        stepRepo.delete(findStep(workflowId, stepId));
    }

    // ═══════════════════════════════════════════════════════════
    //  TRANSITIONS
    // ═══════════════════════════════════════════════════════════

    @Transactional
    public WorkflowTransitionResponse addTransition(Long workflowId, WorkflowTransitionRequest req) {
        Workflow w = findWorkflow(workflowId);
        WorkflowStep from = req.getFromStepId() != null ? findStep(workflowId, req.getFromStepId()) : null;
        WorkflowStep to   = findStep(workflowId, req.getToStepId());
        TransitionRole required  = parseRole(req.getRequiredRole(),  TransitionRole.ANY);
        TransitionRole approver  = parseRole(req.getApproverRole(),  null);
        WorkflowTransition t = WorkflowTransition.builder()
                .workflow(w)
                .fromStep(from)
                .toStep(to)
                .name(req.getName())
                .requiredRole(required)
                .requiresApproval(Boolean.TRUE.equals(req.getRequiresApproval()))
                .approverRole(approver)
                .build();
        return WorkflowTransitionResponse.from(transitionRepo.save(t));
    }

    @Transactional
    public WorkflowTransitionResponse updateTransition(Long workflowId, Long tid, WorkflowTransitionRequest req) {
        WorkflowTransition t = findTransition(workflowId, tid);
        if (req.getFromStepId() != null) t.setFromStep(findStep(workflowId, req.getFromStepId()));
        if (req.getToStepId()   != null) t.setToStep(findStep(workflowId, req.getToStepId()));
        if (req.getName() != null) t.setName(req.getName());
        if (req.getRequiredRole() != null) t.setRequiredRole(parseRole(req.getRequiredRole(), TransitionRole.ANY));
        if (req.getRequiresApproval() != null) t.setRequiresApproval(req.getRequiresApproval());
        if (req.getApproverRole() != null) t.setApproverRole(parseRole(req.getApproverRole(), null));
        return WorkflowTransitionResponse.from(transitionRepo.save(t));
    }

    @Transactional
    public void deleteTransition(Long workflowId, Long tid) {
        transitionRepo.delete(findTransition(workflowId, tid));
    }

    // ═══════════════════════════════════════════════════════════
    //  PROJECT WORKFLOW ASSIGNMENT
    // ═══════════════════════════════════════════════════════════

    @Transactional
    public void assignWorkflow(Long projectId, Long workflowId) {
        Project project = projectRepo.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        Workflow wf = workflowId != null ? findWorkflow(workflowId) : null;
        project.setWorkflow(wf);
        projectRepo.save(project);
    }

    // ═══════════════════════════════════════════════════════════
    //  ISSUE TRANSITIONS
    // ═══════════════════════════════════════════════════════════

    /** Trả về danh sách các transition hợp lệ cho issue + user hiện tại */
    @Transactional(readOnly = true)
    public List<WorkflowTransitionResponse> getAvailableTransitions(Long issueId) {
        User me     = authService.getCurrentUserEntity();
        Issue issue = findIssue(issueId);
        Workflow wf = issue.getProject().getWorkflow();
        if (wf == null) return Collections.emptyList();

        WorkflowStep current = issue.getCurrentStep();
        // Nếu issue chưa có step, dùng initial step của workflow
        if (current == null) {
            current = wf.getSteps().stream()
                    .filter(s -> Boolean.TRUE.equals(s.getIsInitial()))
                    .findFirst().orElse(null);
        }
        final WorkflowStep currentStep = current;
        List<WorkflowTransition> candidates = currentStep != null
                ? transitionRepo.findAvailableFrom(wf, currentStep)
                : transitionRepo.findByWorkflow(wf);

        MemberRole myRole = getMemberRole(issue.getProject(), me);

        return candidates.stream()
                .filter(t -> canTrigger(t, issue, me, myRole))
                .map(WorkflowTransitionResponse::from)
                .collect(Collectors.toList());
    }

    /** Thực hiện transition — hoặc tạo approval request nếu cần phê duyệt */
    @Transactional
    public Object executeTransition(Long issueId, IssueTransitionRequest req) {
        User me     = authService.getCurrentUserEntity();
        Issue issue = findIssue(issueId);
        Workflow wf = issue.getProject().getWorkflow();
        if (wf == null) throw new RuntimeException("Project has no workflow assigned");

        WorkflowTransition transition = transitionRepo.findById(req.getTransitionId())
                .orElseThrow(() -> new RuntimeException("Transition not found"));

        if (!transition.getWorkflow().getId().equals(wf.getId()))
            throw new RuntimeException("Transition does not belong to this project's workflow");

        MemberRole myRole = getMemberRole(issue.getProject(), me);
        if (!canTrigger(transition, issue, me, myRole))
            throw new RuntimeException("You are not allowed to perform this transition");

        String fromName = issue.getCurrentStep() != null ? issue.getCurrentStep().getName() : issue.getStatus().name();

        if (Boolean.TRUE.equals(transition.getRequiresApproval())) {
            // Kiểm tra không có pending approval nào đang chờ
            boolean hasPending = !approvalRepo.findByIssueAndStatus(issue, WorkflowApprovalStatus.PENDING).isEmpty();
            if (hasPending) throw new RuntimeException("There is already a pending approval for this issue");

            WorkflowApproval approval = WorkflowApproval.builder()
                    .issue(issue)
                    .transition(transition)
                    .requestedBy(me)
                    .fromStepName(fromName)
                    .toStepName(transition.getToStep().getName())
                    .status(WorkflowApprovalStatus.PENDING)
                    .comment(req.getComment())
                    .build();
            approvalRepo.save(approval);

            logActivity(issue, me, "APPROVAL_REQUESTED",
                    fromName, transition.getToStep().getName());
            return WorkflowApprovalResponse.from(approval);
        }

        // Chuyển ngay
        applyStep(issue, transition.getToStep(), me, fromName, req.getComment());
        return WorkflowApprovalResponse.from(
                buildSyntheticApproval(issue, transition, me, fromName, req.getComment()));
    }

    // ═══════════════════════════════════════════════════════════
    //  APPROVALS
    // ═══════════════════════════════════════════════════════════

    @Transactional(readOnly = true)
    public List<WorkflowApprovalResponse> getIssueApprovals(Long issueId) {
        Issue issue = findIssue(issueId);
        return approvalRepo.findByIssueOrderByCreatedAtDesc(issue).stream()
                .map(WorkflowApprovalResponse::from).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<WorkflowApprovalResponse> getMyPendingApprovals() {
        User me = authService.getCurrentUserEntity();
        boolean isAdmin = me.getRole() == UserRole.ADMIN;
        return approvalRepo.findPendingForUser(me, isAdmin).stream()
                .map(WorkflowApprovalResponse::from).collect(Collectors.toList());
    }

    @Transactional
    public WorkflowApprovalResponse approve(Long approvalId, ApprovalDecisionRequest req) {
        User me = authService.getCurrentUserEntity();
        WorkflowApproval approval = findApproval(approvalId);
        checkApproverPermission(approval, me);

        String fromName = approval.getFromStepName();
        applyStep(approval.getIssue(), approval.getTransition().getToStep(),
                me, fromName, req.getComment());

        approval.setStatus(WorkflowApprovalStatus.APPROVED);
        approval.setComment(req.getComment());
        approval.setResolvedBy(me);
        approval.setResolvedAt(LocalDateTime.now());
        return WorkflowApprovalResponse.from(approvalRepo.save(approval));
    }

    @Transactional
    public WorkflowApprovalResponse reject(Long approvalId, ApprovalDecisionRequest req) {
        User me = authService.getCurrentUserEntity();
        WorkflowApproval approval = findApproval(approvalId);
        checkApproverPermission(approval, me);

        approval.setStatus(WorkflowApprovalStatus.REJECTED);
        approval.setComment(req.getComment());
        approval.setResolvedBy(me);
        approval.setResolvedAt(LocalDateTime.now());
        approvalRepo.save(approval);

        logActivity(approval.getIssue(), me, "APPROVAL_REJECTED",
                approval.getFromStepName(), approval.getToStepName());
        return WorkflowApprovalResponse.from(approval);
    }

    // ═══════════════════════════════════════════════════════════
    //  PRIVATE HELPERS
    // ═══════════════════════════════════════════════════════════

    private void applyStep(Issue issue, WorkflowStep step, User actor,
                           String fromName, String comment) {
        issue.setCurrentStep(step);
        // Đồng bộ IssueStatus enum nếu step có mappedStatus
        if (step.getMappedStatus() != null) {
            try {
                issue.setStatus(IssueStatus.valueOf(step.getMappedStatus()));
            } catch (IllegalArgumentException ignored) { /* custom step name */ }
        }
        issueRepo.save(issue);
        logActivity(issue, actor, "WORKFLOW_TRANSITION", fromName, step.getName());
        // Gửi email thông báo
        emailService.sendStatusChanged(issue,
                fromName, step.getName(), actor);
    }

    private WorkflowApproval buildSyntheticApproval(Issue issue, WorkflowTransition t,
                                                     User actor, String fromName, String comment) {
        WorkflowApproval a = WorkflowApproval.builder()
                .issue(issue).transition(t).requestedBy(actor)
                .fromStepName(fromName).toStepName(t.getToStep().getName())
                .status(WorkflowApprovalStatus.APPROVED)
                .comment(comment).resolvedBy(actor)
                .resolvedAt(LocalDateTime.now()).build();
        return approvalRepo.save(a);
    }

    private boolean canTrigger(WorkflowTransition t, Issue issue, User me, MemberRole myRole) {
        switch (t.getRequiredRole()) {
            case ANY:      return myRole != null; // phải là member
            case ASSIGNEE: return issue.getAssignee() != null && issue.getAssignee().getId().equals(me.getId());
            case REPORTER: return issue.getReporter().getId().equals(me.getId());
            case MANAGER:  return myRole == MemberRole.MANAGER || myRole == MemberRole.OWNER;
            case ADMIN:    return me.getRole() == UserRole.ADMIN;
            default:       return false;
        }
    }

    private void checkApproverPermission(WorkflowApproval approval, User me) {
        if (approval.getStatus() != WorkflowApprovalStatus.PENDING)
            throw new RuntimeException("Approval is already resolved");
        TransitionRole approverRole = approval.getTransition().getApproverRole();
        if (approverRole == null) throw new RuntimeException("No approver role configured");
        MemberRole myRole = getMemberRole(approval.getIssue().getProject(), me);
        boolean allowed = false;
        switch (approverRole) {
            case ADMIN:    allowed = me.getRole() == UserRole.ADMIN; break;
            case MANAGER:  allowed = myRole == MemberRole.MANAGER || myRole == MemberRole.OWNER; break;
            case REPORTER: allowed = approval.getIssue().getReporter().getId().equals(me.getId()); break;
            default:       break;
        }
        if (!allowed) throw new RuntimeException("You are not authorized to resolve this approval");
    }

    private MemberRole getMemberRole(Project project, User user) {
        if (project.getOwner().getId().equals(user.getId())) return MemberRole.OWNER;
        return memberRepo.findByProjectAndUser(project, user)
                .map(ProjectMember::getRole).orElse(null);
    }

    private void logActivity(Issue issue, User actor, String action, String oldVal, String newVal) {
        activityLogRepo.save(ActivityLog.builder()
                .issue(issue).user(actor).action(action)
                .fieldName("status").oldValue(oldVal).newValue(newVal).build());
    }

    private TransitionRole parseRole(String s, TransitionRole def) {
        if (s == null || s.isEmpty()) return def;
        try { return TransitionRole.valueOf(s.toUpperCase()); }
        catch (IllegalArgumentException e) { return def; }
    }

    private Workflow findWorkflow(Long id) {
        return workflowRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Workflow not found: " + id));
    }

    private WorkflowStep findStep(Long workflowId, Long stepId) {
        WorkflowStep s = stepRepo.findById(stepId)
                .orElseThrow(() -> new RuntimeException("Step not found: " + stepId));
        if (!s.getWorkflow().getId().equals(workflowId))
            throw new RuntimeException("Step does not belong to workflow");
        return s;
    }

    private WorkflowTransition findTransition(Long workflowId, Long tid) {
        WorkflowTransition t = transitionRepo.findById(tid)
                .orElseThrow(() -> new RuntimeException("Transition not found: " + tid));
        if (!t.getWorkflow().getId().equals(workflowId))
            throw new RuntimeException("Transition does not belong to workflow");
        return t;
    }

    private WorkflowApproval findApproval(Long id) {
        return approvalRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Approval not found: " + id));
    }

    private Issue findIssue(Long id) {
        return issueRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Issue not found: " + id));
    }
}
