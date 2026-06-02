package com.tellme.dto.request;

import com.tellme.enums.VersionStatus;
import lombok.Data;
import java.time.LocalDate;

@Data
public class VersionRequest {
    private String name;
    private String description;
    private VersionStatus status;
    private LocalDate releaseDate;
    private LocalDate startDate;
}
