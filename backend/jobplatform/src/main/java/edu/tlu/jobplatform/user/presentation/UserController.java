package edu.tlu.jobplatform.user.presentation;

import edu.tlu.jobplatform.auditlog.domain.annotation.Loggable;
import edu.tlu.jobplatform.ratelimit.domain.model.RateLimitPolicy;
import edu.tlu.jobplatform.ratelimit.presentation.annotation.RateLimit;
import edu.tlu.jobplatform.shared.response.ApiResponse;
import edu.tlu.jobplatform.shared.security.SecurityUtils;
import edu.tlu.jobplatform.user.application.usecase.DeactivateUserUseCase;
import edu.tlu.jobplatform.user.application.usecase.GetCurrentUserUseCase;
import edu.tlu.jobplatform.user.application.usecase.UpdateUserUseCase;
import edu.tlu.jobplatform.user.domain.model.User;
import edu.tlu.jobplatform.user.presentation.dto.UpdateUserRequest;
import edu.tlu.jobplatform.user.presentation.dto.UserResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "User", description = "Quản lý thông tin người dùng")
public class UserController {

        private final GetCurrentUserUseCase getCurrentUserUseCase;
        private final UpdateUserUseCase updateUserUseCase;
        private final DeactivateUserUseCase deactivateUserUseCase;

        // ── GET /api/v1/users/me ──────────────────────────────────────────

        @Operation(summary = "Lấy thông tin bản thân")
        @ApiResponses({
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Thành công"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Chưa đăng nhập")
        })
        @GetMapping("/me")
        @RateLimit(policy = "user-read", scope = RateLimitPolicy.Scope.USER)
        @Loggable(action = "USER_GET_PROFILE", resourceType = "User")
        public ResponseEntity<ApiResponse<UserResponse>> getMe() {
                UUID userId = SecurityUtils.getCurrentUserIdOrThrow();
                return ResponseEntity.ok(ApiResponse.success(getCurrentUserUseCase.execute(userId)));
        }

        // ── PATCH /api/v1/users/me ────────────────────────────────────────

        @Operation(summary = "Cập nhật thông tin cá nhân")
        @PatchMapping("/me")
        @RateLimit(policy = "user-write", scope = RateLimitPolicy.Scope.USER)
        @Loggable(action = "USER_UPDATE_PROFILE", resourceType = "User", logResult = true)
        public ResponseEntity<ApiResponse<UserResponse>> updateMe(
                        @Valid @RequestBody UpdateUserRequest req) {

                UUID userId = SecurityUtils.getCurrentUserIdOrThrow();
                User user = updateUserUseCase.execute(userId, toCommand(req));
                return ResponseEntity.ok(
                                ApiResponse.success(UserResponse.from(user), "Cập nhật thông tin thành công."));
        }

        // ── DELETE /api/v1/users/me ───────────────────────────────────────

        @Operation(summary = "Tự vô hiệu hoá tài khoản")
        @DeleteMapping("/me")
        @RateLimit(policy = "user-write", scope = RateLimitPolicy.Scope.USER)
        @Loggable(action = "USER_DEACTIVATE_SELF", resourceType = "User", logResult = true)
        public ResponseEntity<ApiResponse<Void>> deactivateMe(
                        @RequestParam(required = false, defaultValue = "User request") String reason) {

                UUID userId = SecurityUtils.getCurrentUserIdOrThrow();
                deactivateUserUseCase.execute(userId, reason);
                return ResponseEntity.ok(ApiResponse.success("Tài khoản đã được vô hiệu hoá."));
        }

        // ── [ADMIN] GET /api/v1/users/{id} ───────────────────────────────

        @Operation(summary = "[ADMIN] Lấy thông tin user theo ID")
        @GetMapping("/{id}")
        @PreAuthorize("hasAnyRole('ADMIN')")
        @RateLimit(policy = "admin-read", scope = RateLimitPolicy.Scope.USER)
        @Loggable(action = "ADMIN_GET_USER", resourceType = "User")
        public ResponseEntity<ApiResponse<UserResponse>> getUserById(
                        @Parameter(description = "UUID của user") @PathVariable UUID id) {
                return ResponseEntity.ok(ApiResponse.success(getCurrentUserUseCase.execute(id)));
        }

        // ── [ADMIN] PATCH /api/v1/users/{id} ─────────────────────────────

        @Operation(summary = "[ADMIN] Cập nhật thông tin user")
        @PatchMapping("/{id}")
        @PreAuthorize("hasAnyRole('ADMIN')")
        @RateLimit(policy = "admin-write", scope = RateLimitPolicy.Scope.USER)
        @Loggable(action = "ADMIN_UPDATE_USER", resourceType = "User", logResult = true)
        public ResponseEntity<ApiResponse<UserResponse>> updateUser(
                        @PathVariable UUID id,
                        @Valid @RequestBody UpdateUserRequest req) {

                User user = updateUserUseCase.execute(id, toCommand(req));
                return ResponseEntity.ok(
                                ApiResponse.success(UserResponse.from(user), "Cập nhật thành công."));
        }

        // ── [ADMIN] DELETE /api/v1/users/{id} ────────────────────────────

        @Operation(summary = "[ADMIN] Vô hiệu hoá tài khoản user")
        @DeleteMapping("/{id}")
        @PreAuthorize("hasAnyRole('ADMIN')")
        @RateLimit(policy = "admin-write", scope = RateLimitPolicy.Scope.USER)
        @Loggable(action = "ADMIN_DEACTIVATE_USER", resourceType = "User", logResult = true)
        public ResponseEntity<ApiResponse<Void>> deactivateUser(
                        @PathVariable UUID id,
                        @RequestParam(required = false, defaultValue = "Admin action") String reason) {

                deactivateUserUseCase.execute(id, reason);
                return ResponseEntity.ok(ApiResponse.success("Tài khoản đã được vô hiệu hoá."));
        }

        // ── Helper ───────

        private UpdateUserUseCase.Command toCommand(UpdateUserRequest req) {
                return new UpdateUserUseCase.Command(
                                req.getFullName(),
                                req.getPhone(),
                                req.getAvatarUrl());
        }
}