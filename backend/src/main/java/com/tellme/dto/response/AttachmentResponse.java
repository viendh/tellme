package com.tellme.dto.response;

import com.tellme.entity.Attachment;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AttachmentResponse {
    private Long id;
    private Long issueId;
    private String originalName;
    private Long fileSize;
    private String contentType;
    private String downloadUrl;
    private UserResponse uploader;
    private LocalDateTime createdAt;

    public static AttachmentResponse fromAttachment(Attachment a) {
        AttachmentResponse r = new AttachmentResponse();
        r.setId(a.getId());
        r.setIssueId(a.getIssue().getId());
        r.setOriginalName(a.getOriginalName());
        r.setFileSize(a.getFileSize());
        r.setContentType(a.getContentType());
        r.setDownloadUrl("/api/attachments/" + a.getId() + "/download");
        r.setUploader(UserResponse.fromUser(a.getUploader()));
        r.setCreatedAt(a.getCreatedAt());
        return r;
    }
}
