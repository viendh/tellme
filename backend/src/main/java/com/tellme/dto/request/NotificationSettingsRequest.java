package com.tellme.dto.request;

import lombok.Data;

@Data
public class NotificationSettingsRequest {

    private Boolean notifyOnAssigned;
    private Boolean notifyOnStatusChange;
    private Boolean notifyOnComment;
}
