package com.tellme.dto.request;

import lombok.Data;

@Data
public class SavedFilterRequest {
    private String name;
    private String filterCriteria; // JSON string
    private Boolean isShared;
    private Boolean isFavorite;
}
