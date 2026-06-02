package com.tellme.entity;

import com.tellme.enums.EmailStatus;
import com.tellme.enums.EmailType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "email_logs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmailLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String recipient;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String subject;

    @Enumerated(EnumType.STRING)
    @Column(name = "email_type", nullable = false)
    private EmailType emailType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EmailStatus status;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "error_stack", columnDefinition = "TEXT")
    private String errorStack;

    @Column(name = "issue_id")
    private Long issueId;

    @Column(name = "issue_title")
    private String issueTitle;

    @CreationTimestamp
    @Column(name = "sent_at", updatable = false)
    private LocalDateTime sentAt;
}
