package com.tellme.service;

import com.tellme.dto.response.AttachmentResponse;
import com.tellme.entity.Attachment;
import com.tellme.entity.Issue;
import com.tellme.entity.User;
import com.tellme.repository.AttachmentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.*;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AttachmentService {

    private static final Logger log = LoggerFactory.getLogger(AttachmentService.class);

    @Value("${app.upload.dir:./uploads}")
    private String uploadDir;

    @Autowired
    private AttachmentRepository attachmentRepository;

    @Autowired
    private IssueService issueService;

    @Autowired
    private AuthService authService;

    private Path getUploadPath() throws IOException {
        Path path = Paths.get(uploadDir).toAbsolutePath().normalize();
        Files.createDirectories(path);
        return path;
    }

    @Transactional
    public List<AttachmentResponse> uploadFiles(Long issueId, MultipartFile[] files) throws IOException {
        User currentUser = authService.getCurrentUserEntity();
        Issue issue = issueService.getIssueWithAccessCheck(issueId, currentUser);

        Path uploadPath = getUploadPath();
        List<AttachmentResponse> responses = new java.util.ArrayList<>();

        for (MultipartFile file : files) {
            if (file.isEmpty()) continue;

            String originalName = file.getOriginalFilename();
            String ext = "";
            if (originalName != null && originalName.contains(".")) {
                ext = originalName.substring(originalName.lastIndexOf("."));
            }
            String storedName = UUID.randomUUID().toString() + ext;

            Path targetPath = uploadPath.resolve(storedName);
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            Attachment attachment = Attachment.builder()
                    .issue(issue)
                    .uploader(currentUser)
                    .fileName(storedName)
                    .originalName(originalName != null ? originalName : storedName)
                    .fileSize(file.getSize())
                    .contentType(file.getContentType())
                    .build();

            responses.add(AttachmentResponse.fromAttachment(attachmentRepository.save(attachment)));
        }

        return responses;
    }

    @Transactional(readOnly = true)
    public List<AttachmentResponse> getAttachments(Long issueId) {
        User currentUser = authService.getCurrentUserEntity();
        Issue issue = issueService.getIssueWithAccessCheck(issueId, currentUser);
        return attachmentRepository.findByIssueOrderByCreatedAtDesc(issue)
                .stream()
                .map(AttachmentResponse::fromAttachment)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Object[] downloadAttachment(Long attachmentId) throws MalformedURLException {
        User currentUser = authService.getCurrentUserEntity();
        Attachment attachment = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new RuntimeException("Attachment not found"));

        issueService.getIssueWithAccessCheck(attachment.getIssue().getId(), currentUser);

        try {
            Path filePath = Paths.get(uploadDir).toAbsolutePath().normalize().resolve(attachment.getFileName());
            Resource resource = new UrlResource(filePath.toUri());
            if (!resource.exists()) {
                throw new RuntimeException("File not found");
            }
            return new Object[]{resource, attachment};
        } catch (MalformedURLException e) {
            throw new RuntimeException("File not found");
        }
    }

    @Transactional
    public void deleteAttachment(Long attachmentId) throws IOException {
        User currentUser = authService.getCurrentUserEntity();
        Attachment attachment = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new RuntimeException("Attachment not found"));

        issueService.getIssueWithAccessCheck(attachment.getIssue().getId(), currentUser);

        if (!attachment.getUploader().getId().equals(currentUser.getId())) {
            throw new RuntimeException("You can only delete your own attachments");
        }

        try {
            Path filePath = Paths.get(uploadDir).toAbsolutePath().normalize().resolve(attachment.getFileName());
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            log.warn("Could not delete file: {}", e.getMessage());
        }

        attachmentRepository.delete(attachment);
    }
}
