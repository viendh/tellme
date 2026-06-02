package com.tellme.dto.request;

import lombok.Data;

@Data
public class ApprovalDecisionRequest {
    /** Ghi chú phê duyệt hoặc lý do từ chối */
    private String comment;
}
