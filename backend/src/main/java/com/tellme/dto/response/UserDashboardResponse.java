package com.tellme.dto.response;

import lombok.Data;
import java.util.List;

@Data
public class UserDashboardResponse {
    private long totalProjects;
    private long totalAssigned;
    private long todoCount;
    private long inProgressCount;
    private long testingCount;
    private long doneCount;
    private long overdueCount;
    private List<IssueResponse> recentIssues;
}
