package com.tellme.dto.request;

import lombok.Data;

import javax.validation.constraints.NotNull;

@Data
public class UpdateUserStatusRequest {

    @NotNull
    private Boolean isActive;
}
