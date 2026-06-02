package com.tellme.enums;

public enum MemberRole {
    OWNER,      // Tạo project, toàn quyền
    MANAGER,    // Quản lý sprint, assign task, quản lý members
    DEVELOPER,  // Cập nhật task, thêm comment
    TESTER,     // Cập nhật task, thêm comment
    VIEWER      // Chỉ xem
}
