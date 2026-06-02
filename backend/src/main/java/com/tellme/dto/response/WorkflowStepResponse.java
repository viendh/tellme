package com.tellme.dto.response;

import com.tellme.entity.WorkflowStep;
import lombok.Data;

@Data
public class WorkflowStepResponse {
    private Long id;
    private String name;
    private String color;
    private Integer position;
    private Boolean isInitial;
    private Boolean isFinal;
    private String mappedStatus;

    public static WorkflowStepResponse from(WorkflowStep s) {
        WorkflowStepResponse r = new WorkflowStepResponse();
        r.setId(s.getId());
        r.setName(s.getName());
        r.setColor(s.getColor());
        r.setPosition(s.getPosition());
        r.setIsInitial(s.getIsInitial());
        r.setIsFinal(s.getIsFinal());
        r.setMappedStatus(s.getMappedStatus());
        return r;
    }
}
