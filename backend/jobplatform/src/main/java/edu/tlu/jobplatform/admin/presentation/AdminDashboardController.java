package edu.tlu.jobplatform.admin.presentation;

import edu.tlu.jobplatform.admin.application.usecase.AdminDashboardUseCase;
import edu.tlu.jobplatform.shared.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * GET /api/v1/admin/dashboard — Tổng quan thống kê
 */
@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@Tag(name = "Admin", description = "Quản trị hệ thống")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
public class AdminDashboardController {

    private final AdminDashboardUseCase dashboardUseCase;

    @Operation(summary = "Dashboard — số liệu tổng quan")
    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<AdminDashboardUseCase.DashboardStats>> getDashboard() {
        return ResponseEntity.ok(ApiResponse.success(dashboardUseCase.execute()));
    }
}
