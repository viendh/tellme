package com.tellme.dto.response;

import com.tellme.entity.Version;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class VersionResponse {
    private Long id;
    private Long projectId;
    private String name;
    private String description;
    private String status;
    private LocalDate releaseDate;
    private LocalDate startDate;
    private LocalDateTime createdAt;

    public static VersionResponse from(Version v) {
        VersionResponse r = new VersionResponse();
        r.setId(v.getId());
        r.setProjectId(v.getProject().getId());
        r.setName(v.getName());
        r.setDescription(v.getDescription());
        r.setStatus(v.getStatus().name());
        r.setReleaseDate(v.getReleaseDate());
        r.setStartDate(v.getStartDate());
        r.setCreatedAt(v.getCreatedAt());
        return r;
    }
}
