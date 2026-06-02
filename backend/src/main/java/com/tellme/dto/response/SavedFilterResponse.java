package com.tellme.dto.response;

import com.tellme.entity.SavedFilter;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class SavedFilterResponse {
    private Long id;
    private String name;
    private String filterCriteria;
    private Long creatorId;
    private String creatorName;
    private Boolean isShared;
    private Boolean isFavorite;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static SavedFilterResponse from(SavedFilter f) {
        SavedFilterResponse r = new SavedFilterResponse();
        r.setId(f.getId());
        r.setName(f.getName());
        r.setFilterCriteria(f.getFilterCriteria());
        r.setCreatorId(f.getCreator().getId());
        r.setCreatorName(f.getCreator().getFullName());
        r.setIsShared(f.getIsShared());
        r.setIsFavorite(f.getIsFavorite());
        r.setCreatedAt(f.getCreatedAt());
        r.setUpdatedAt(f.getUpdatedAt());
        return r;
    }
}
