package com.tellme.service;

import com.tellme.dto.response.NotificationResponse;
import com.tellme.entity.Issue;
import com.tellme.entity.Notification;
import com.tellme.entity.User;
import com.tellme.repository.NotificationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    @Autowired private NotificationRepository notificationRepository;
    @Autowired private AuthService authService;

    @Autowired(required = false)
    private SimpMessagingTemplate messagingTemplate;

    /* ── Public API ── */

    @Transactional(readOnly = true)
    public List<NotificationResponse> getMyNotifications() {
        User user = authService.getCurrentUserEntity();
        return notificationRepository.findTop30ByUserOrderByCreatedAtDesc(user)
                .stream().map(NotificationResponse::from).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public long countUnread() {
        return notificationRepository.countByUserAndReadFalse(authService.getCurrentUserEntity());
    }

    @Transactional
    public void markRead(Long id) {
        notificationRepository.markReadById(id, authService.getCurrentUserEntity());
    }

    @Transactional
    public void markAllRead() {
        notificationRepository.markAllReadByUser(authService.getCurrentUserEntity());
    }

    /* ── Internal push helpers (called from IssueService, CommentService) ── */

    @Async
    public void pushIssueAssigned(User recipient, Issue issue, User assignedBy) {
        if (recipient.getId().equals(assignedBy.getId())) return;
        push(recipient, "ISSUE_ASSIGNED",
            "Task được giao cho bạn",
            assignedBy.getFullName() + " đã giao task cho bạn: " + issue.getTitle(),
            issue);
    }

    @Async
    public void pushStatusChanged(Issue issue, String newStatus, User changedBy) {
        // Notify assignee (if different from changer)
        if (issue.getAssignee() != null && !issue.getAssignee().getId().equals(changedBy.getId())) {
            push(issue.getAssignee(), "STATUS_CHANGED",
                "Trạng thái task thay đổi",
                changedBy.getFullName() + " đổi trạng thái → " + newStatus.replace("_", " ") + ": " + issue.getTitle(),
                issue);
        }
        // Notify reporter (if different from changer and assignee)
        if (issue.getReporter() != null && !issue.getReporter().getId().equals(changedBy.getId())
                && (issue.getAssignee() == null || !issue.getReporter().getId().equals(issue.getAssignee().getId()))) {
            push(issue.getReporter(), "STATUS_CHANGED",
                "Trạng thái task thay đổi",
                changedBy.getFullName() + " đổi trạng thái → " + newStatus.replace("_", " ") + ": " + issue.getTitle(),
                issue);
        }
    }

    @Async
    public void pushCommentAdded(Issue issue, String commentPreview, User author) {
        // Notify assignee
        if (issue.getAssignee() != null && !issue.getAssignee().getId().equals(author.getId())) {
            push(issue.getAssignee(), "COMMENT_ADDED",
                "Bình luận mới trên task của bạn",
                author.getFullName() + ": " + truncate(commentPreview, 80),
                issue);
        }
        // Notify reporter
        if (issue.getReporter() != null && !issue.getReporter().getId().equals(author.getId())
                && (issue.getAssignee() == null || !issue.getReporter().getId().equals(issue.getAssignee().getId()))) {
            push(issue.getReporter(), "COMMENT_ADDED",
                "Bình luận mới trên task bạn tạo",
                author.getFullName() + ": " + truncate(commentPreview, 80),
                issue);
        }
    }

    /* ── Core save + push ── */

    private void push(User recipient, String type, String title, String body, Issue issue) {
        try {
            Notification notif = Notification.builder()
                    .user(recipient)
                    .type(type)
                    .title(title)
                    .body(body)
                    .issueId(issue != null ? issue.getId() : null)
                    .issueKey(issue != null ? issue.getIssueKey() : null)
                    .projectName(issue != null && issue.getProject() != null ? issue.getProject().getName() : null)
                    .read(false)
                    .build();

            Notification saved = notificationRepository.save(notif);
            NotificationResponse dto = NotificationResponse.from(saved);

            // Push via WebSocket to the specific user
            if (messagingTemplate != null) {
                messagingTemplate.convertAndSendToUser(
                    recipient.getEmail(),
                    "/queue/notifications",
                    dto
                );
            }
        } catch (Exception e) {
            log.error("Failed to push notification to {}: {}", recipient.getEmail(), e.getMessage());
        }
    }

    private String truncate(String s, int max) {
        if (s == null) return "";
        return s.length() > max ? s.substring(0, max) + "…" : s;
    }
}
