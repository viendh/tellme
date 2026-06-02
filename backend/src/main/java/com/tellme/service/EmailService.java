package com.tellme.service;

import com.tellme.entity.EmailLog;
import com.tellme.entity.Issue;
import com.tellme.entity.Comment;
import com.tellme.entity.User;
import com.tellme.enums.EmailStatus;
import com.tellme.enums.EmailType;
import com.tellme.repository.EmailLogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import javax.mail.MessagingException;
import javax.mail.internet.MimeMessage;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.Objects;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Autowired
    private EmailLogRepository emailLogRepository;

    @Value("${app.mail.enabled:false}")
    private boolean mailEnabled;

    @Value("${app.mail.from:noreply@tellme.app}")
    private String mailFrom;

    @Value("${app.mail.base-url:http://localhost:3000}")
    private String baseUrl;

    @Async
    public void sendIssueAssigned(User assignee, Issue issue, User assignedBy) {
        if (!canSend(assignee) || !Boolean.TRUE.equals(assignee.getNotifyOnAssigned())) return;
        String subject = "[Tellme] Task được giao cho bạn: " + issue.getTitle();
        String body = buildIssueEmail(
            "Task mới được giao cho bạn",
            assignedBy.getFullName() + " đã giao task cho bạn.",
            issue,
            "Xem Task"
        );
        sendHtml(assignee.getEmail(), subject, body, EmailType.ISSUE_ASSIGNED, issue.getId(), issue.getTitle());
    }

    @Async
    public void sendStatusChanged(Issue issue, String oldStatus, String newStatus, User changedBy) {
        String subject = "[Tellme] Trạng thái task thay đổi: " + issue.getTitle();
        if (issue.getReporter() != null && !issue.getReporter().getId().equals(changedBy.getId())
                && canSend(issue.getReporter())
                && Boolean.TRUE.equals(issue.getReporter().getNotifyOnStatusChange())) {
            String body = buildIssueEmail(
                "Trạng thái task đã được cập nhật",
                changedBy.getFullName() + " đã chuyển trạng thái từ <b>" + formatStatus(oldStatus)
                    + "</b> sang <b>" + formatStatus(newStatus) + "</b>.",
                issue, "Xem Task"
            );
            sendHtml(issue.getReporter().getEmail(), subject, body, EmailType.STATUS_CHANGED, issue.getId(), issue.getTitle());
        }
        if (issue.getAssignee() != null && !issue.getAssignee().getId().equals(changedBy.getId())
                && canSend(issue.getAssignee())
                && Boolean.TRUE.equals(issue.getAssignee().getNotifyOnStatusChange())) {
            String body = buildIssueEmail(
                "Trạng thái task của bạn đã được cập nhật",
                changedBy.getFullName() + " đã chuyển trạng thái từ <b>" + formatStatus(oldStatus)
                    + "</b> sang <b>" + formatStatus(newStatus) + "</b>.",
                issue, "Xem Task"
            );
            sendHtml(issue.getAssignee().getEmail(), subject, body, EmailType.STATUS_CHANGED, issue.getId(), issue.getTitle());
        }
    }

    @Async
    public void sendCommentAdded(Issue issue, Comment comment, User author) {
        java.util.Set<String> recipients = new java.util.HashSet<>();
        if (issue.getAssignee() != null && !issue.getAssignee().getId().equals(author.getId())
                && canSend(issue.getAssignee())
                && Boolean.TRUE.equals(issue.getAssignee().getNotifyOnComment())) {
            recipients.add(issue.getAssignee().getEmail());
        }
        if (issue.getReporter() != null && !issue.getReporter().getId().equals(author.getId())
                && canSend(issue.getReporter())
                && Boolean.TRUE.equals(issue.getReporter().getNotifyOnComment())) {
            recipients.add(issue.getReporter().getEmail());
        }
        if (recipients.isEmpty()) return;

        String subject = "[Tellme] Bình luận mới trên: " + issue.getTitle();
        String body = buildCommentEmail(issue, comment, author);
        recipients.forEach(email ->
            sendHtml(email, subject, body, EmailType.COMMENT_ADDED, issue.getId(), issue.getTitle())
        );
    }

    @Async
    public void sendIssueCreated(Issue issue) {
        if (issue.getAssignee() == null || !canSend(issue.getAssignee())
                || !Boolean.TRUE.equals(issue.getAssignee().getNotifyOnAssigned())) return;
        if (issue.getReporter() != null && issue.getAssignee().getId().equals(issue.getReporter().getId())) return;
        String subject = "[Tellme] Task mới được tạo: " + issue.getTitle();
        String body = buildIssueEmail(
            "Task mới đã được tạo và giao cho bạn",
            (issue.getReporter() != null ? issue.getReporter().getFullName() : "Someone") + " đã tạo task và giao cho bạn.",
            issue, "Xem Task"
        );
        sendHtml(issue.getAssignee().getEmail(), subject, body, EmailType.ISSUE_CREATED, issue.getId(), issue.getTitle());
    }

    public void sendOverdueReminder(User assignee, Issue issue) {
        if (!canSend(assignee)) return;
        String subject = "[Tellme] ⚠️ Task quá hạn: " + issue.getTitle();
        String body = buildIssueEmail(
            "Task đã quá hạn hoàn thành",
            "Task này đã quá hạn vào <b>" + formatDate(issue.getDueDate()) + "</b>. Vui lòng cập nhật trạng thái hoặc liên hệ PM.",
            issue, "Xem Task ngay"
        );
        sendHtml(assignee.getEmail(), subject, body, EmailType.OVERDUE_REMINDER, issue.getId(), issue.getTitle());
    }

    public void sendSlaViolation(User assignee, Issue issue) {
        if (!canSend(assignee)) return;
        String subject = "[Tellme] 🚨 SLA vi phạm: " + issue.getTitle();
        String body = buildIssueEmail(
            "Task đã vượt thời gian SLA",
            "Task này đã vượt quá <b>" + issue.getSlaHours() + " giờ</b> SLA cam kết. Yêu cầu xử lý ngay.",
            issue, "Xử lý ngay"
        );
        sendHtml(assignee.getEmail(), subject, body, EmailType.SLA_VIOLATION, issue.getId(), issue.getTitle());
    }

    public void sendDailyDigest(User user, java.util.List<Issue> issues, int overdueCount) {
        if (!canSend(user) || issues.isEmpty()) return;
        String subject = "[Tellme] 📋 Tóm tắt công việc hôm nay — " + java.time.LocalDate.now();
        StringBuilder rows = new StringBuilder();
        for (Issue i : issues) {
            String color = getPriorityColor(i.getPriority().name());
            rows.append("<tr>")
                .append("<td style='padding:8px 12px;border-bottom:1px solid #f3f4f6'>")
                .append("<a href='").append(baseUrl).append("/issues/").append(i.getId())
                .append("' style='color:#2563eb;text-decoration:none'>").append(escapeHtml(i.getTitle())).append("</a></td>")
                .append("<td style='padding:8px 12px;border-bottom:1px solid #f3f4f6;text-align:center'>")
                .append("<span style='background:#dbeafe;color:#1d4ed8;padding:2px 8px;border-radius:12px;font-size:12px'>")
                .append(i.getStatus().name().replace("_"," ")).append("</span></td>")
                .append("<td style='padding:8px 12px;border-bottom:1px solid #f3f4f6;text-align:center;color:").append(color).append(";font-weight:bold;font-size:12px'>")
                .append(i.getPriority().name()).append("</td>")
                .append("<td style='padding:8px 12px;border-bottom:1px solid #f3f4f6;font-size:12px;color:#6b7280'>")
                .append(i.getDueDate() != null ? formatDate(i.getDueDate()) : "—").append("</td>")
                .append("</tr>");
        }
        String overdueHtml = overdueCount > 0
            ? "<div style='background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:12px 16px;margin-bottom:20px'>"
              + "<p style='margin:0;color:#dc2626;font-weight:bold'>⚠️ Bạn có <b>" + overdueCount + " task quá hạn</b>. Vui lòng xử lý ngay!</p></div>"
            : "";
        String body = "<!DOCTYPE html><html><body style='font-family:Arial,sans-serif;background:#f5f5f5;margin:0;padding:20px'>"
            + "<div style='max-width:680px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 4px rgba(0,0,0,.1)'>"
            + "<div style='background:#2563eb;padding:24px 32px'><h1 style='color:#fff;margin:0;font-size:20px'>Tellme — Daily Digest</h1>"
            + "<p style='color:#bfdbfe;margin:4px 0 0;font-size:14px'>" + java.time.LocalDate.now() + "</p></div>"
            + "<div style='padding:32px'>"
            + "<p style='color:#374151'>Xin chào <b>" + escapeHtml(user.getFullName()) + "</b>, đây là tóm tắt công việc của bạn hôm nay:</p>"
            + overdueHtml
            + "<table style='width:100%;border-collapse:collapse;margin-top:8px'>"
            + "<thead><tr style='background:#f9fafb'>"
            + "<th style='padding:8px 12px;text-align:left;font-size:12px;color:#6b7280;font-weight:600;border-bottom:2px solid #e5e7eb'>TASK</th>"
            + "<th style='padding:8px 12px;text-align:center;font-size:12px;color:#6b7280;font-weight:600;border-bottom:2px solid #e5e7eb'>TRẠNG THÁI</th>"
            + "<th style='padding:8px 12px;text-align:center;font-size:12px;color:#6b7280;font-weight:600;border-bottom:2px solid #e5e7eb'>ƯU TIÊN</th>"
            + "<th style='padding:8px 12px;text-align:left;font-size:12px;color:#6b7280;font-weight:600;border-bottom:2px solid #e5e7eb'>HẠN</th>"
            + "</tr></thead><tbody>" + rows + "</tbody></table>"
            + "<div style='margin-top:24px;text-align:center'>"
            + "<a href='" + baseUrl + "/my-issues' style='display:inline-block;background:#2563eb;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold'>Xem tất cả task &rarr;</a>"
            + "</div></div>"
            + "<div style='background:#f9fafb;padding:16px 32px;border-top:1px solid #e5e7eb'>"
            + "<p style='color:#9ca3af;font-size:12px;margin:0'>Email này được gửi tự động lúc 7:30 sáng các ngày trong tuần.</p>"
            + "</div></div></body></html>";
        sendHtml(user.getEmail(), subject, body, EmailType.DAILY_DIGEST, null, null);
    }

    public void sendSprintEndingReminder(User member, com.tellme.entity.Sprint sprint, int daysLeft, int remaining) {
        if (!canSend(member)) return;
        String subject = "[Tellme] ⏳ Sprint kết thúc sau " + daysLeft + " ngày: " + sprint.getName();
        String color = daysLeft == 1 ? "#dc2626" : "#f97316";
        String body = "<!DOCTYPE html><html><body style='font-family:Arial,sans-serif;background:#f5f5f5;margin:0;padding:20px'>"
            + "<div style='max-width:600px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 4px rgba(0,0,0,.1)'>"
            + "<div style='background:#2563eb;padding:24px 32px'><h1 style='color:#fff;margin:0;font-size:20px'>Tellme</h1></div>"
            + "<div style='padding:32px'>"
            + "<h2 style='color:#1f2937;margin-top:0'>Sprint sắp kết thúc</h2>"
            + "<div style='background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;padding:20px;margin:16px 0;text-align:center'>"
            + "<p style='font-size:32px;font-weight:bold;color:" + color + ";margin:0'>" + daysLeft + " ngày</p>"
            + "<p style='color:#374151;margin:8px 0 0'>Sprint <b>" + escapeHtml(sprint.getName()) + "</b> kết thúc vào <b>" + sprint.getEndDate() + "</b></p>"
            + "</div>"
            + "<p style='color:#374151'>Còn <b style='color:#dc2626'>" + remaining + " issue chưa hoàn thành</b> trong sprint này. Hãy cùng team hoàn thành mục tiêu!</p>"
            + "<div style='margin-top:24px'>"
            + "<a href='" + baseUrl + "/projects/" + sprint.getProject().getId() + "/board' style='display:inline-block;background:#2563eb;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold'>Xem Board &rarr;</a>"
            + "</div></div>"
            + "<div style='background:#f9fafb;padding:16px 32px;border-top:1px solid #e5e7eb'>"
            + "<p style='color:#9ca3af;font-size:12px;margin:0'>Email tự động từ Tellme Task Manager.</p>"
            + "</div></div></body></html>";
        sendHtml(member.getEmail(), subject, body, EmailType.SPRINT_ENDING, null, sprint.getName());
    }

    private String formatDate(java.time.LocalDateTime dt) {
        if (dt == null) return "—";
        return String.format("%02d/%02d/%d", dt.getDayOfMonth(), dt.getMonthValue(), dt.getYear());
    }

    private boolean canSend(User user) {
        return mailEnabled && mailSender != null
            && user.getEmail() != null && !user.getEmail().isEmpty();
    }

    private void sendHtml(String to, String subject, String htmlBody,
                          EmailType emailType, Long issueId, String issueTitle) {
        String safeFrom = mailFrom != null ? mailFrom : "noreply@tellme.app";
        String safeTo = to != null ? to : "";
        String safeSubject = subject != null ? subject : "";
        String safeBody = htmlBody != null ? htmlBody : "";
        EmailStatus status = EmailStatus.SENT;
        String errorMessage = null;
        String errorStack = null;
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(safeFrom);
            helper.setTo(safeTo);
            helper.setSubject(safeSubject);
            helper.setText(safeBody, true);
            mailSender.send(message);
            log.info("Email sent to {}: {}", to, subject);
        } catch (MessagingException e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
            status = EmailStatus.FAILED;
            errorMessage = e.getMessage();
            errorStack = getStackTrace(e);
        } catch (Exception e) {
            log.error("Unexpected error sending email: {}", e.getMessage());
            status = EmailStatus.FAILED;
            errorMessage = e.getMessage();
            errorStack = getStackTrace(e);
        } finally {
            try {
                EmailLog emailLog = EmailLog.builder()
                    .recipient(safeTo)
                    .subject(safeSubject)
                    .emailType(emailType)
                    .status(status)
                    .errorMessage(errorMessage)
                    .errorStack(errorStack)
                    .issueId(issueId)
                    .issueTitle(issueTitle)
                    .build();
                emailLogRepository.save(Objects.requireNonNull(emailLog));
            } catch (Exception ex) {
                log.error("Failed to persist email log: {}", ex.getMessage());
            }
        }
    }

    private String buildIssueEmail(String heading, String message, Issue issue, String btnText) {
        String issueUrl = baseUrl + "/issues/" + issue.getId();
        String priorityColor = getPriorityColor(issue.getPriority().name());
        return "<!DOCTYPE html><html><body style='font-family:Arial,sans-serif;background:#f5f5f5;margin:0;padding:20px'>"
            + "<div style='max-width:600px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 4px rgba(0,0,0,.1)'>"
            + "<div style='background:#2563eb;padding:24px 32px'>"
            + "<h1 style='color:#fff;margin:0;font-size:20px'>Tellme</h1>"
            + "</div>"
            + "<div style='padding:32px'>"
            + "<h2 style='color:#1f2937;margin-top:0'>" + heading + "</h2>"
            + "<p style='color:#6b7280'>" + message + "</p>"
            + "<div style='background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin:20px 0'>"
            + "<p style='margin:0 0 8px;font-weight:bold;color:#1f2937'>" + escapeHtml(issue.getTitle()) + "</p>"
            + "<p style='margin:0;color:#6b7280;font-size:14px'>"
            + "Dự án: <b>" + escapeHtml(issue.getProject().getName()) + "</b> &nbsp;|&nbsp; "
            + "Loại: <b>" + issue.getType().name() + "</b> &nbsp;|&nbsp; "
            + "Ưu tiên: <span style='color:" + priorityColor + ";font-weight:bold'>" + issue.getPriority().name() + "</span>"
            + "</p>"
            + "</div>"
            + "<a href='" + issueUrl + "' style='display:inline-block;background:#2563eb;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold'>"
            + btnText + " &rarr;</a>"
            + "</div>"
            + "<div style='background:#f9fafb;padding:16px 32px;border-top:1px solid #e5e7eb'>"
            + "<p style='color:#9ca3af;font-size:12px;margin:0'>Email này được gửi tự động từ Tellme Task Manager. Vui lòng không reply.</p>"
            + "</div>"
            + "</div></body></html>";
    }

    private String buildCommentEmail(Issue issue, Comment comment, User author) {
        String issueUrl = baseUrl + "/issues/" + issue.getId();
        return "<!DOCTYPE html><html><body style='font-family:Arial,sans-serif;background:#f5f5f5;margin:0;padding:20px'>"
            + "<div style='max-width:600px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 4px rgba(0,0,0,.1)'>"
            + "<div style='background:#2563eb;padding:24px 32px'>"
            + "<h1 style='color:#fff;margin:0;font-size:20px'>Tellme</h1>"
            + "</div>"
            + "<div style='padding:32px'>"
            + "<h2 style='color:#1f2937;margin-top:0'>Bình luận mới</h2>"
            + "<p style='color:#6b7280'><b>" + escapeHtml(author.getFullName()) + "</b> đã bình luận trên task <b>" + escapeHtml(issue.getTitle()) + "</b>:</p>"
            + "<div style='background:#f0f9ff;border-left:4px solid #2563eb;padding:16px;border-radius:0 8px 8px 0;margin:16px 0'>"
            + "<p style='margin:0;color:#1f2937'>" + escapeHtml(comment.getContent()) + "</p>"
            + "</div>"
            + "<a href='" + issueUrl + "' style='display:inline-block;background:#2563eb;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold'>Xem Task &rarr;</a>"
            + "</div>"
            + "<div style='background:#f9fafb;padding:16px 32px;border-top:1px solid #e5e7eb'>"
            + "<p style='color:#9ca3af;font-size:12px;margin:0'>Email này được gửi tự động từ Tellme Task Manager.</p>"
            + "</div>"
            + "</div></body></html>";
    }

    private String formatStatus(String status) {
        return status.replace("_", " ");
    }

    private String getPriorityColor(String priority) {
        switch (priority) {
            case "CRITICAL": return "#dc2626";
            case "HIGH":     return "#f97316";
            case "MEDIUM":   return "#eab308";
            default:         return "#6b7280";
        }
    }

    private String getStackTrace(Throwable t) {
        StringWriter sw = new StringWriter();
        t.printStackTrace(new PrintWriter(sw));
        return sw.toString();
    }

    private String escapeHtml(String text) {
        if (text == null) return "";
        return text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
                   .replace("\"", "&quot;").replace("'", "&#39;");
    }
}
