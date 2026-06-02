package com.tellme.service;

import com.tellme.dto.request.CommentRequest;
import com.tellme.dto.response.CommentResponse;
import com.tellme.entity.ActivityLog;
import com.tellme.entity.Comment;
import com.tellme.entity.Issue;
import com.tellme.entity.User;
import com.tellme.repository.ActivityLogRepository;
import com.tellme.repository.CommentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CommentService {

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private ActivityLogRepository activityLogRepository;

    @Autowired
    private IssueService issueService;

    @Autowired
    private AuthService authService;

    @Autowired
    private EmailService emailService;

    @Transactional(readOnly = true)
    public List<CommentResponse> getIssueComments(Long issueId) {
        User currentUser = authService.getCurrentUserEntity();
        Issue issue = issueService.getIssueWithAccessCheck(issueId, currentUser);

        return commentRepository.findByIssueOrderByCreatedAtDesc(issue)
                .stream()
                .map(CommentResponse::fromComment)
                .collect(Collectors.toList());
    }

    @Transactional
    public CommentResponse createComment(Long issueId, CommentRequest request) {
        User currentUser = authService.getCurrentUserEntity();
        Issue issue = issueService.getIssueWithAccessCheck(issueId, currentUser);

        Comment comment = Comment.builder()
                .issue(issue)
                .author(currentUser)
                .content(request.getContent())
                .build();

        comment = commentRepository.save(comment);

        emailService.sendCommentAdded(issue, comment, currentUser);

        // Log activity
        ActivityLog log = ActivityLog.builder()
                .issue(issue)
                .user(currentUser)
                .action("added comment")
                .fieldName("comment")
                .oldValue(null)
                .newValue(request.getContent())
                .build();
        activityLogRepository.save(log);

        return CommentResponse.fromComment(comment);
    }

    @Transactional
    public CommentResponse updateComment(Long commentId, CommentRequest request) {
        User currentUser = authService.getCurrentUserEntity();
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found with id: " + commentId));

        // Verify access to the project
        issueService.getIssueWithAccessCheck(comment.getIssue().getId(), currentUser);

        // Only the author can edit
        if (!comment.getAuthor().getId().equals(currentUser.getId())) {
            throw new RuntimeException("You can only edit your own comments");
        }

        comment.setContent(request.getContent());
        comment = commentRepository.save(comment);

        return CommentResponse.fromComment(comment);
    }

    @Transactional
    public void deleteComment(Long commentId) {
        User currentUser = authService.getCurrentUserEntity();
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found with id: " + commentId));

        // Verify access to the project
        issueService.getIssueWithAccessCheck(comment.getIssue().getId(), currentUser);

        // Only the author can delete their comment (or project admin/owner)
        if (!comment.getAuthor().getId().equals(currentUser.getId())) {
            throw new RuntimeException("You can only delete your own comments");
        }

        commentRepository.delete(comment);
    }
}
