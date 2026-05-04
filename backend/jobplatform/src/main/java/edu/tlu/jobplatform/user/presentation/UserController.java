package edu.tlu.jobplatform.user.presentation;

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

/**
 * Controller xử lý User endpoints.
 *
 * Endpoints:
 * GET /api/users/me — Lấy thông tin user đang đăng nhập
 * PATCH /api/users/me — Cập nhật thông tin cá nhân
 * DELETE /api/users/me — Tự deactivate tài khoản
 * GET /api/users/{id} — Lấy thông tin user bất kỳ (ADMIN)
 * PATCH /api/users/{id} — Admin cập nhật user
 * DELETE /api/users/{id} — Admin deactivate user
 */
@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "User", description = "Quản lý thông tin người dùng")
public class UserController {

        private final GetCurrentUserUseCase getCurrentUserUseCase;
        private final UpdateUserUseCase updateUserUseCase;
        private final DeactivateUserUseCase deactivateUserUseCase;

        // ── GET /api/users/me ─────────────────────────────────────────

        @Operation(summary = "Lấy thông tin bản thân", description = "Trả về profile đầy đủ của user đang đăng nhập. Dùng sau login để load profile.")
        @ApiResponses({
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Thành công"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Chưa đăng nhập")
        })
        @GetMapping("/me")
        public ResponseEntity<ApiResponse<UserResponse>> getMe() {
                UUID userId = SecurityUtils.getCurrentUserIdOrThrow();
                User user = getCurrentUserUseCase.execute(userId);
                return ResponseEntity.ok(ApiResponse.success(UserResponse.from(user)));
        }

        // ── PATCH /api/users/me ───────────────────────────────────────

        @Operation(summary = "Cập nhật thông tin cá nhân", description = """
                        Cập nhật một phần thông tin cá nhân (PATCH semantics).
                        Chỉ truyền những field muốn thay đổi — field không truyền sẽ giữ nguyên.

                        **Không thể thay đổi qua endpoint này:** email, role, password.
                        """)
        @ApiResponses({
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Cập nhật thành công"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Dữ liệu không hợp lệ")
        })
        @PatchMapping("/me")
        public ResponseEntity<ApiResponse<UserResponse>> updateMe(
                        @Valid @RequestBody UpdateUserRequest req) {

                UUID userId = SecurityUtils.getCurrentUserIdOrThrow();
                User user = updateUserUseCase.execute(userId, toCommand(req));
                return ResponseEntity.ok(
                                ApiResponse.success(UserResponse.from(user), "Cập nhật thông tin thành công."));
        }

        // ── DELETE /api/users/me ──────────────────────────────────────

        @Operation(summary = "Tự vô hiệu hoá tài khoản", description = """
                        User tự yêu cầu vô hiệu hoá tài khoản của mình (soft delete).
                        Dữ liệu không bị xóa — tài khoản chỉ không thể đăng nhập được nữa.
                        Để khôi phục, liên hệ support.
                        """)
        @DeleteMapping("/me")
        public ResponseEntity<ApiResponse<Void>> deactivateMe(
                        @RequestParam(required = false, defaultValue = "User request") String reason) {

                UUID userId = SecurityUtils.getCurrentUserIdOrThrow();
                deactivateUserUseCase.execute(userId, reason);
                return ResponseEntity.ok(
                                ApiResponse.success("Tài khoản đã được vô hiệu hoá."));
        }

        // ────────────────
        // Admin endpoints
        // ────────────────

        // ── GET /api/users/{id} ───────────────────────────────────────

        @Operation(summary = "[ADMIN] Lấy thông tin user theo ID", description = "Chỉ ADMIN mới được gọi endpoint này.")
        @GetMapping("/{id}")
        @PreAuthorize("hasAnyRole('ADMIN')")
        public ResponseEntity<ApiResponse<UserResponse>> getUserById(
                        @Parameter(description = "UUID của user") @PathVariable UUID id) {

                User user = getCurrentUserUseCase.execute(id);
                return ResponseEntity.ok(ApiResponse.success(UserResponse.from(user)));
        }

        // ── PATCH /api/users/{id} ─────────────────────────────────────

        @Operation(summary = "[ADMIN] Cập nhật thông tin user", description = "Admin cập nhật thông tin của bất kỳ user nào.")
        @PatchMapping("/{id}")
        @PreAuthorize("hasAnyRole('ADMIN')")
        public ResponseEntity<ApiResponse<UserResponse>> updateUser(
                        @PathVariable UUID id,
                        @Valid @RequestBody UpdateUserRequest req) {

                User user = updateUserUseCase.execute(id, toCommand(req));
                return ResponseEntity.ok(
                                ApiResponse.success(UserResponse.from(user), "Cập nhật thành công."));
        }

        // ── DELETE /api/users/{id} ────────────────────────────────────

        @Operation(summary = "[ADMIN] Vô hiệu hoá tài khoản user", description = "Admin vô hiệu hoá tài khoản của bất kỳ user nào.")
        @DeleteMapping("/{id}")
        @PreAuthorize("hasAnyRole('ADMIN')")
        public ResponseEntity<ApiResponse<Void>> deactivateUser(
                        @PathVariable UUID id,
                        @RequestParam(required = false, defaultValue = "Admin action") String reason) {

                deactivateUserUseCase.execute(id, reason);
                return ResponseEntity.ok(
                                ApiResponse.success("Tài khoản đã được vô hiệu hoá."));
        }

        // ── Helper ────────

        private UpdateUserUseCase.Command toCommand(UpdateUserRequest req) {
                return new UpdateUserUseCase.Command(
                                req.getFullName(),
                                req.getPhone(),
                                req.getAvatarUrl());
        }
}