package com.tellme.dto.response;

import com.tellme.entity.Comment;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CommentResponse {

    private Long id;
    private Long issueId;
    private UserResponse author;
    private String content;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static CommentResponse fromComment(Comment comment) {
        CommentResponse response = new CommentResponse();
        response.setId(comment.getId());
        response.setIssueId(comment.getIssue().getId());
        response.setAuthor(UserResponse.fromUser(comment.getAuthor()));
        response.setContent(comment.getContent());
        response.setCreatedAt(comment.getCreatedAt());
        response.setUpdatedAt(comment.getUpdatedAt());
        return response;
    }
}
