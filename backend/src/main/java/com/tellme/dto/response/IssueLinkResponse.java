package com.tellme.dto.response;

import com.tellme.entity.IssueLink;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class IssueLinkResponse {
    private Long id;
    private String linkType;
    // For display: the "other" issue relative to context
    private Long issueId;
    private String issueKey;
    private String issueTitle;
    private String issueStatus;
    private String issuePriority;
    private LocalDateTime createdAt;

    /** Build from perspective of sourceIssue */
    public static IssueLinkResponse from(IssueLink link, boolean asSource) {
        IssueLinkResponse r = new IssueLinkResponse();
        r.setId(link.getId());
        r.setCreatedAt(link.getCreatedAt());

        if (asSource) {
            r.setLinkType(link.getLinkType().name());
            r.setIssueId(link.getTargetIssue().getId());
            r.setIssueKey(link.getTargetIssue().getIssueKey());
            r.setIssueTitle(link.getTargetIssue().getTitle());
            r.setIssueStatus(link.getTargetIssue().getStatus().name());
            r.setIssuePriority(link.getTargetIssue().getPriority().name());
        } else {
            // Reverse the label
            r.setLinkType(reverse(link.getLinkType().name()));
            r.setIssueId(link.getSourceIssue().getId());
            r.setIssueKey(link.getSourceIssue().getIssueKey());
            r.setIssueTitle(link.getSourceIssue().getTitle());
            r.setIssueStatus(link.getSourceIssue().getStatus().name());
            r.setIssuePriority(link.getSourceIssue().getPriority().name());
        }
        return r;
    }

    private static String reverse(String type) {
        switch (type) {
            case "BLOCKS": return "IS_BLOCKED_BY";
            case "IS_BLOCKED_BY": return "BLOCKS";
            case "DUPLICATES": return "IS_DUPLICATED_BY";
            case "IS_DUPLICATED_BY": return "DUPLICATES";
            case "CLONES": return "IS_CLONED_BY";
            case "IS_CLONED_BY": return "CLONES";
            default: return type;
        }
    }
}
