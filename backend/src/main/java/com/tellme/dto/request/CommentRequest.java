package com.tellme.dto.request;

import lombok.Data;

import javax.validation.constraints.NotBlank;

@Data
public class CommentRequest {

    @NotBlank(message = "Comment content is required")
    private String content;
}
