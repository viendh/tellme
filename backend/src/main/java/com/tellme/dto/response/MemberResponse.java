package com.tellme.dto.response;

import com.tellme.entity.ProjectMember;
import lombok.Data;

@Data
public class MemberResponse {
    private Long id;
    private UserResponse user;
    private String role;

    public static MemberResponse fromMember(ProjectMember m) {
        MemberResponse r = new MemberResponse();
        r.setId(m.getId());
        r.setUser(UserResponse.fromUser(m.getUser()));
        r.setRole(m.getRole().name());
        return r;
    }
}
