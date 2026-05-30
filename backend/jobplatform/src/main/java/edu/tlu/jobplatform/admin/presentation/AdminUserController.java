package edu.tlu.jobplatform.admin.presentation;

import edu.tlu.jobplatform.admin.application.usecase.AdminCreateUserUseCase;
import edu.tlu.jobplatform.admin.application.usecase.AdminUserUseCase;
import edu.tlu.jobplatform.admin.presentation.dto.request.AdminCreateUserRequest;
import edu.tlu.jobplatform.admin.presentation.dto.response.AdminUserResponse;
import edu.tlu.jobplatform.ratelimit.domain.model.RateLimitPolicy;
import edu.tlu.jobplatform.ratelimit.presentation.annotation.RateLimit;
import edu.tlu.jobplatform.shared.audit.Loggable;
import edu.tlu.jobplatform.shared.response.ApiResponse;
import edu.tlu.jobplatform.shared.response.PageResponse;
import edu.tlu.jobplatform.user.domain.model.UserRole;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * Endpoints:
 * GET /api/v1/admin/users — Danh sách users
 * GET /api/v1/admin/users/{id} — Chi tiết user
 * PATCH /api/v1/admin/users/{id}/toggle — Khoá/mở khoá
 * PATCH /api/v1/admin/users/{id}/role — Đổi role
 */
@RestController
@RequestMapping("/api/v1/admin/users")
@RequiredArgsConstructor
@Tag(name = "Admin - Users", description = "Quản lý người dùng")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasAnyRole('ADMIN')")
public class AdminUserController {

        private final AdminUserUseCase adminUserUseCase;
        private final AdminCreateUserUseCase adminCreateUserUseCase;

        @Operation(summary = "Danh sách users (có filter)")
        @GetMapping
        @RateLimit(policy = "admin-read", scope = RateLimitPolicy.Scope.USER)
        public ResponseEntity<ApiResponse<PageResponse<AdminUserResponse>>> listUsers(
                        @RequestParam(required = false) String keyword,
                        @RequestParam(required = false) UserRole role,
                        @RequestParam(defaultValue = "0") int page,
                        @RequestParam(defaultValue = "20") int size) {

                var pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
                var result = adminUserUseCase.listUsers(keyword, role, pageable)
                                .map(AdminUserResponse::from);
                return ResponseEntity.ok(ApiResponse.success(PageResponse.from(result)));
        }

        @Operation(summary = "Tạo tài khoản user mới")
        @PostMapping
        @RateLimit(policy = "admin-write", scope = RateLimitPolicy.Scope.USER)
        @Loggable(action = "ADMIN_CREATE_USER", resourceType = "User")
        public ResponseEntity<ApiResponse<AdminUserResponse>> createUser(
                        @Valid @RequestBody AdminCreateUserRequest req) {

                var cmd = new AdminCreateUserUseCase.Command(
                                req.getEmail(),
                                req.getFullName(),
                                req.getPassword(),
                                req.getRole());
                var user = adminCreateUserUseCase.execute(cmd);
                return ResponseEntity
                                .status(HttpStatus.CREATED)
                                .body(ApiResponse.success(AdminUserResponse.from(user), "Tài khoản đã được tạo."));
        }

        @Operation(summary = "Chi tiết user")
        @GetMapping("/{id}")
        @RateLimit(policy = "admin-read", scope = RateLimitPolicy.Scope.USER)
        public ResponseEntity<ApiResponse<AdminUserResponse>> getUser(@PathVariable UUID id) {
                return ResponseEntity.ok(
                                ApiResponse.success(AdminUserResponse.from(adminUserUseCase.getUser(id))));
        }

        @Operation(summary = "Khoá / mở khoá tài khoản")
        @PatchMapping("/{id}/toggle")
        @RateLimit(policy = "admin-write", scope = RateLimitPolicy.Scope.USER)
        @Loggable(action = "ADMIN_TOGGLE_USER", resourceType = "User")
        public ResponseEntity<ApiResponse<AdminUserResponse>> toggleActive(@PathVariable UUID id) {
                var user = adminUserUseCase.toggleActive(id);
                String msg = user.isActive() ? "Tài khoản đã được mở khoá." : "Tài khoản đã bị khoá.";
                return ResponseEntity.ok(ApiResponse.success(AdminUserResponse.from(user), msg));
        }

        @Operation(summary = "Đổi role user")
        @PatchMapping("/{id}/role")
        @RateLimit(policy = "admin-write", scope = RateLimitPolicy.Scope.USER)
        @Loggable(action = "ADMIN_CHANGE_ROLE", resourceType = "User")
        public ResponseEntity<ApiResponse<AdminUserResponse>> changeRole(
                        @PathVariable UUID id,
                        @RequestParam @NotNull UserRole role) {

                var user = adminUserUseCase.changeRole(id, role);
                return ResponseEntity.ok(
                                ApiResponse.success(AdminUserResponse.from(user), "Role đã được cập nhật."));
        }
}
