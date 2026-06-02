package com.tellme.dto.response;

import lombok.Data;
import java.util.List;

@Data
public class ProjectDashboardResponse {
    private long totalIssues;
    // Status
    private long todoCount;
    private long inProgressCount;
    private long testingCount;
    private long uatCount;
    private long doneCount;
    // Type
    private long bugCount;
    private long taskCount;
    private long storyCount;
    private long epicCount;
    // Priority
    private long lowCount;
    private long mediumCount;
    private long highCount;
    private long criticalCount;
    // Sprint
    private SprintSummary activeSprint;
    // Members
    private List<MemberWorkload> memberWorkload;
    // Activity
    private List<ActivityLogResponse> recentActivity;

    @Data
    public static class SprintSummary {
        private Long id;
        private String name;
        private String goal;
        private String startDate;
        private String endDate;
        private long totalIssues;
        private long doneIssues;
        private long inProgressIssues;
    }

    @Data
    public static class MemberWorkload {
        private UserResponse user;
        private long totalIssues;
        private long inProgressIssues;
        private long doneIssues;
    }
}
