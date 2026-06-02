package com.tellme.dto.response;

import com.tellme.entity.Component;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ComponentResponse {
    private Long id;
    private Long projectId;
    private String name;
    private String description;
    private Long leadId;
    private String leadName;
    private LocalDateTime createdAt;

    public static ComponentResponse from(Component c) {
        ComponentResponse r = new ComponentResponse();
        r.setId(c.getId());
        r.setProjectId(c.getProject().getId());
        r.setName(c.getName());
        r.setDescription(c.getDescription());
        if (c.getLead() != null) {
            r.setLeadId(c.getLead().getId());
            r.setLeadName(c.getLead().getFullName());
        }
        r.setCreatedAt(c.getCreatedAt());
        return r;
    }
}
