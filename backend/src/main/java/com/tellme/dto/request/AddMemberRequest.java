package com.tellme.dto.request;

import com.tellme.enums.MemberRole;
import lombok.Data;
import javax.validation.constraints.NotNull;

@Data
public class AddMemberRequest {
    @NotNull
    private Long userId;
    @NotNull
    private MemberRole role;
}
