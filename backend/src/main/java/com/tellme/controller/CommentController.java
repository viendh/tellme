package com.tellme.controller;

import com.tellme.dto.request.CommentRequest;
import com.tellme.dto.response.CommentResponse;
import com.tellme.service.CommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api")
public class CommentController {

    @Autowired
    private CommentService commentService;

    @GetMapping("/issues/{issueId}/comments")
    public ResponseEntity<List<CommentResponse>> getIssueComments(@PathVariable Long issueId) {
        List<CommentResponse> comments = commentService.getIssueComments(issueId);
        return ResponseEntity.ok(comments);
    }

    @PostMapping("/issues/{issueId}/comments")
    public ResponseEntity<CommentResponse> createComment(@PathVariable Long issueId,
                                                          @Valid @RequestBody CommentRequest request) {
        CommentResponse comment = commentService.createComment(issueId, request);
        return ResponseEntity.ok(comment);
    }

    @PutMapping("/comments/{id}")
    public ResponseEntity<CommentResponse> updateComment(@PathVariable Long id,
                                                          @Valid @RequestBody CommentRequest request) {
        CommentResponse comment = commentService.updateComment(id, request);
        return ResponseEntity.ok(comment);
    }

    @DeleteMapping("/comments/{id}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long id) {
        commentService.deleteComment(id);
        return ResponseEntity.noContent().build();
    }
}
