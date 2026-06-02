package com.tellme.dto.request;

import com.tellme.enums.UserRole;
import lombok.Data;

import javax.validation.constraints.NotNull;

@Data
public class UpdateUserRoleRequest {

    @NotNull
    private UserRole role;
}
