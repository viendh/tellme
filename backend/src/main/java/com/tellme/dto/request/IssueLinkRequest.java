package com.tellme.dto.request;

import com.tellme.enums.IssueLinkType;
import lombok.Data;

@Data
public class IssueLinkRequest {
    private Long targetIssueId;
    private IssueLinkType linkType;
}
