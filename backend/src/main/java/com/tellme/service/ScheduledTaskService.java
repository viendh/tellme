package com.tellme.service;

import com.tellme.entity.Issue;
import com.tellme.entity.Sprint;
import com.tellme.entity.User;
import com.tellme.enums.IssueStatus;
import com.tellme.repository.IssueRepository;
import com.tellme.repository.ProjectMemberRepository;
import com.tellme.repository.SprintRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ScheduledTaskService {

    private static final Logger log = LoggerFactory.getLogger(ScheduledTaskService.class);

    @Autowired private IssueRepository issueRepository;
    @Autowired private SprintRepository sprintRepository;
    @Autowired private ProjectMemberRepository projectMemberRepository;
    @Autowired private EmailService emailService;

    /**
     * Nhắc nhở issue quá hạn — chạy mỗi ngày lúc 9:00 sáng.
     * Gửi email đến từng assignee có issue chưa xong nhưng đã qua dueDate.
     */
    @Scheduled(cron = "0 0 9 * * *")
    public void checkOverdueIssues() {
        log.info("[Scheduled] checkOverdueIssues started");
        List<Issue> overdueIssues = issueRepository.findAllOverdue(LocalDateTime.now());
        int sent = 0;
        for (Issue issue : overdueIssues) {
            try {
                emailService.sendOverdueReminder(issue.getAssignee(), issue);
                sent++;
            } catch (Exception e) {
                log.error("Failed to send overdue reminder for issue {}: {}", issue.getId(), e.getMessage());
            }
        }
        log.info("[Scheduled] checkOverdueIssues done — {} reminders sent", sent);
    }

    /**
     * Cảnh báo vi phạm SLA — chạy mỗi ngày lúc 9:15 sáng.
     * Gửi email khi issue vượt quá số giờ SLA cam kết mà chưa hoàn thành.
     */
    @Scheduled(cron = "0 15 9 * * *")
    public void checkSlaViolations() {
        log.info("[Scheduled] checkSlaViolations started");
        List<Issue> breached = issueRepository.findAllSlaBreached(LocalDateTime.now());
        int sent = 0;
        for (Issue issue : breached) {
            try {
                emailService.sendSlaViolation(issue.getAssignee(), issue);
                sent++;
            } catch (Exception e) {
                log.error("Failed to send SLA violation alert for issue {}: {}", issue.getId(), e.getMessage());
            }
        }
        log.info("[Scheduled] checkSlaViolations done — {} alerts sent", sent);
    }

    /**
     * Daily digest — chạy lúc 7:30 sáng các ngày trong tuần (Thứ 2 – Thứ 6).
     * Tóm tắt danh sách issue đang thực hiện + số issue quá hạn gửi cho từng user.
     */
    @Scheduled(cron = "0 30 7 * * MON-FRI")
    public void sendDailyDigest() {
        log.info("[Scheduled] sendDailyDigest started");
        List<Issue> activeIssues = issueRepository.findAllActiveWithAssignee();
        LocalDateTime now = LocalDateTime.now();

        // Nhóm issue theo assignee
        Map<User, List<Issue>> byUser = new LinkedHashMap<>();
        for (Issue issue : activeIssues) {
            byUser.computeIfAbsent(issue.getAssignee(), k -> new java.util.ArrayList<>()).add(issue);
        }

        int sent = 0;
        for (Map.Entry<User, List<Issue>> entry : byUser.entrySet()) {
            User user = entry.getKey();
            List<Issue> issues = entry.getValue();
            long overdueCount = issues.stream()
                .filter(i -> i.getDueDate() != null && i.getDueDate().isBefore(now))
                .count();
            try {
                emailService.sendDailyDigest(user, issues, (int) overdueCount);
                sent++;
            } catch (Exception e) {
                log.error("Failed to send daily digest to {}: {}", user.getEmail(), e.getMessage());
            }
        }
        log.info("[Scheduled] sendDailyDigest done — digest sent to {} users", sent);
    }

    /**
     * Nhắc nhở sprint sắp kết thúc — chạy mỗi ngày lúc 8:00 sáng.
     * Gửi email khi sprint còn 1 hoặc 2 ngày nữa là kết thúc.
     */
    @Scheduled(cron = "0 0 8 * * *")
    public void checkSprintEnding() {
        log.info("[Scheduled] checkSprintEnding started");
        LocalDate today = LocalDate.now();

        for (int daysLeft : new int[]{1, 2}) {
            LocalDate targetDate = today.plusDays(daysLeft);
            List<Sprint> sprints = sprintRepository.findActiveSprintsEndingOn(targetDate);

            for (Sprint sprint : sprints) {
                // Đếm issue chưa hoàn thành trong sprint
                List<Issue> remaining = issueRepository
                    .findByProjectAndSprintOrderByPositionAsc(sprint.getProject(), sprint)
                    .stream()
                    .filter(i -> i.getStatus() != IssueStatus.DONE)
                    .collect(Collectors.toList());

                if (remaining.isEmpty()) continue;

                // Gửi đến tất cả thành viên dự án
                projectMemberRepository.findByProject(sprint.getProject()).forEach(member -> {
                    try {
                        emailService.sendSprintEndingReminder(member.getUser(), sprint, daysLeft, remaining.size());
                    } catch (Exception e) {
                        log.error("Failed to send sprint ending reminder to {}: {}", member.getUser().getEmail(), e.getMessage());
                    }
                });
                log.info("[Scheduled] Sprint '{}' ending in {} day(s), {} issues remaining",
                    sprint.getName(), daysLeft, remaining.size());
            }
        }
        log.info("[Scheduled] checkSprintEnding done");
    }
}
