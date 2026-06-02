package com.tellme.enums;

/**
 * Ai được phép kích hoạt một transition trong workflow.
 */
public enum TransitionRole {
    ANY,       // bất kỳ thành viên nào trong project
    ASSIGNEE,  // người được giao task
    REPORTER,  // người tạo task
    MANAGER,   // MANAGER hoặc OWNER của project
    ADMIN      // system admin
}
