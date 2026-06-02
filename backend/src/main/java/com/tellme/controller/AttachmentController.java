package com.tellme.controller;

import com.tellme.dto.response.AttachmentResponse;
import com.tellme.entity.Attachment;
import com.tellme.service.AttachmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequestMapping("/api")
public class AttachmentController {

    @Autowired
    private AttachmentService attachmentService;

    @PostMapping("/issues/{issueId}/attachments")
    public ResponseEntity<List<AttachmentResponse>> upload(
            @PathVariable Long issueId,
            @RequestParam("files") MultipartFile[] files) throws IOException {
        return ResponseEntity.ok(attachmentService.uploadFiles(issueId, files));
    }

    @GetMapping("/issues/{issueId}/attachments")
    public ResponseEntity<List<AttachmentResponse>> list(@PathVariable Long issueId) {
        return ResponseEntity.ok(attachmentService.getAttachments(issueId));
    }

    @GetMapping("/attachments/{id}/download")
    public ResponseEntity<Resource> download(@PathVariable Long id) throws Exception {
        Object[] result = attachmentService.downloadAttachment(id);
        Resource resource = (Resource) result[0];
        Attachment attachment = (Attachment) result[1];

        String contentType = attachment.getContentType();
        if (contentType == null) contentType = "application/octet-stream";

        String encodedName = URLEncoder.encode(attachment.getOriginalName(), StandardCharsets.UTF_8.toString())
                .replace("+", "%20");

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename*=UTF-8''" + encodedName)
                .body(resource);
    }

    @DeleteMapping("/attachments/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) throws IOException {
        attachmentService.deleteAttachment(id);
        return ResponseEntity.noContent().build();
    }
}
