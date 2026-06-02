package com.tellme.dto.request;

import lombok.Data;

@Data
public class ComponentRequest {
    private String name;
    private String description;
    private Long leadId;
}
