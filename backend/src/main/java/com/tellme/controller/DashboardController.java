package com.tellme.controller;

import com.tellme.dto.response.ProjectDashboardResponse;
import com.tellme.dto.response.UserDashboardResponse;
import com.tellme.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @GetMapping("/dashboard")
    public ResponseEntity<UserDashboardResponse> getUserDashboard() {
        return ResponseEntity.ok(dashboardService.getUserDashboard());
    }

    @GetMapping("/projects/{id}/dashboard")
    public ResponseEntity<ProjectDashboardResponse> getProjectDashboard(@PathVariable Long id) {
        return ResponseEntity.ok(dashboardService.getProjectDashboard(id));
    }
}
