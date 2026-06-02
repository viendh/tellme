package com.tellme.dto.response;

import com.tellme.entity.EmailLog;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class EmailLogResponse {

    private Long id;
    private String recipient;
    private String subject;
    private String emailType;
    private String status;
    private String errorMessage;
    private String errorStack;
    private Long issueId;
    private String issueTitle;
    private LocalDateTime sentAt;

    public static EmailLogResponse fromEmailLog(EmailLog emailLog) {
        EmailLogResponse r = new EmailLogResponse();
        r.setId(emailLog.getId());
        r.setRecipient(emailLog.getRecipient());
        r.setSubject(emailLog.getSubject());
        r.setEmailType(emailLog.getEmailType().name());
        r.setStatus(emailLog.getStatus().name());
        r.setErrorMessage(emailLog.getErrorMessage());
        r.setErrorStack(emailLog.getErrorStack());
        r.setIssueId(emailLog.getIssueId());
        r.setIssueTitle(emailLog.getIssueTitle());
        r.setSentAt(emailLog.getSentAt());
        return r;
    }
}
