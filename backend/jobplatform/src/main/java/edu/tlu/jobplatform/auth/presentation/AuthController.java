package edu.tlu.jobplatform.auth.presentation;

import edu.tlu.jobplatform.auth.application.usecase.*;
import edu.tlu.jobplatform.auth.domain.model.AuthToken;
import edu.tlu.jobplatform.auth.presentation.dto.*;
import edu.tlu.jobplatform.shared.audit.Loggable;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import edu.tlu.jobplatform.shared.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@Slf4j
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Auth", description = "Đăng ký, đăng nhập, quản lý phiên đăng nhập")
public class AuthController {

        private final RegisterUseCase registerUseCase;
        private final LoginUseCase loginUseCase;
        private final RefreshTokenUseCase refreshTokenUseCase;
        private final LogoutUseCase logoutUseCase;
        private final VerifyEmailUseCase verifyEmailUseCase;

        @Value("${app.base-url:http://localhost:8080}")
        private String baseUrl;

        // ── POST /api/v1/auth/register ────────────────────────────────────────────

        @Operation(summary = "Đăng ký tài khoản", description = """
                        Tạo tài khoản mới. Role mặc định là **CANDIDATE** nếu không truyền.

                        Sau khi đăng ký, hệ thống gửi OTP 6 số đến email.
                        Phải xác thực email qua **/verify-email** trước khi đăng nhập.

                        **Yêu cầu mật khẩu:** ≥8 ký tự, ít nhất 1 chữ hoa, 1 chữ thường, 1 số.
                        """)
        @ApiResponses({
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Đăng ký thành công — OTP đã gửi về email"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Validation error"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "422", description = "Email đã tồn tại / Mật khẩu yếu")
        })
        @PostMapping("/register")
        @Loggable(action = "USER_REGISTERED", resourceType = "User")
        public ResponseEntity<ApiResponse<RegisterResponse>> register(
                        @Valid @RequestBody RegisterRequest req) {

                RegisterUseCase.Result result = registerUseCase.execute(
                                new RegisterUseCase.Command(
                                                req.getEmail(), req.getPassword(), req.getFullName(), req.getRole()));

                return ResponseEntity.status(HttpStatus.CREATED)
                                .body(ApiResponse.success(
                                                new RegisterResponse(result.userId(), result.email(), result.role()),
                                                "Đăng ký thành công. Vui lòng kiểm tra email và nhập mã OTP."));
        }

        // ── POST /api/v1/auth/verify-email ────────────────────────────────────────

        @Operation(summary = "Xác thực email sau đăng ký", description = """
                        Nhập mã OTP 6 số đã gửi về email để kích hoạt tài khoản.
                        Mã có hiệu lực trong **10 phút**.
                        """)
        @ApiResponses({
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Xác thực thành công"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "422", description = "OTP sai / hết hạn / email không tồn tại")
        })
        @PostMapping("/verify-email")
        public ResponseEntity<ApiResponse<Void>> verifyEmail(
                        @Valid @RequestBody VerifyEmailRequest req) {

                verifyEmailUseCase.execute(
                                new VerifyEmailUseCase.Command(req.email(), req.code()));

                return ResponseEntity.ok(
                                ApiResponse.success("Email xác thực thành công. Bạn có thể đăng nhập ngay."));
        }

        // ── POST /api/v1/auth/login ───────────────────────────────────────────────

        @Operation(summary = "Đăng nhập", description = "Đăng nhập bằng email/password. Trả về JWT access token (15p) và refresh token (30 ngày).")
        @ApiResponses({
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Đăng nhập thành công"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "422", description = "Sai credentials / Chưa xác thực email / Bị khóa")
        })
        @PostMapping("/login")
        @Loggable(action = "USER_LOGIN", resourceType = "User")
        public ResponseEntity<ApiResponse<TokenResponse>> login(
                        @Valid @RequestBody LoginRequest req) {

                AuthToken token = loginUseCase.execute(
                                new LoginUseCase.Command(req.getEmail(), req.getPassword()));

                return ResponseEntity.ok(
                                ApiResponse.success(TokenResponse.from(token), "Đăng nhập thành công."));
        }

        // ── POST /api/v1/auth/refresh ─────────────────────────────────────────────

        @Operation(summary = "Làm mới access token", description = "Dùng refresh token để lấy access token mới. Không cần đăng nhập lại.")
        @PostMapping("/refresh")
        public ResponseEntity<ApiResponse<TokenResponse>> refresh(
                        @RequestParam String refreshToken) {

                AuthToken token = refreshTokenUseCase.execute(refreshToken);
                return ResponseEntity.ok(ApiResponse.success(TokenResponse.from(token)));
        }

        // ── POST /api/v1/auth/logout ──────────────────────────────────────────────

        @Operation(summary = "Đăng xuất thiết bị hiện tại")
        @SecurityRequirement(name = "bearerAuth")
        @PostMapping("/logout")
        public ResponseEntity<ApiResponse<Void>> logout(
                        @RequestHeader("Authorization") String authHeader) {

                logoutUseCase.logout(extractToken(authHeader));
                return ResponseEntity.ok(ApiResponse.success("Đăng xuất thành công."));
        }

        // ── POST /api/v1/auth/logout-all ──────────────────────────────────────────

        @Operation(summary = "Đăng xuất tất cả thiết bị", description = "Revoke toàn bộ refresh token — đăng xuất mọi thiết bị đang đăng nhập.")
        @SecurityRequirement(name = "bearerAuth")
        @PostMapping("/logout-all")
        public ResponseEntity<ApiResponse<Void>> logoutAll(
                        @RequestHeader("Authorization") String authHeader) {

                logoutUseCase.logoutAll(extractToken(authHeader));
                return ResponseEntity.ok(ApiResponse.success("Đã đăng xuất khỏi tất cả thiết bị."));
        }

        // ── GET /api/v1/auth/oauth2/url/{provider} ────────────────────────────────

        @Operation(summary = "Lấy OAuth2 authorization URL", description = "Trả về URL để frontend redirect sang Google/Facebook.")
        @GetMapping("/oauth2/url/{provider}")
        public ResponseEntity<ApiResponse<Map<String, String>>> getOAuth2Url(
                        @PathVariable String provider) {

                List<String> supported = List.of("google", "facebook");
                if (!supported.contains(provider.toLowerCase())) {
                        throw new BusinessRuleException(
                                        "Provider không hỗ trợ: " + provider + ". Hỗ trợ: " + supported,
                                        "UNSUPPORTED_PROVIDER");
                }

                String url = baseUrl + "/oauth2/authorization/" + provider.toLowerCase();
                return ResponseEntity.ok(ApiResponse.success(Map.of("url", url)));
        }

        // ── GET /api/v1/auth/oauth2/failure ───────────────────────────────────────

        @Operation(summary = "OAuth2 failure — Spring Security redirect target")
        @GetMapping("/oauth2/failure")
        public ResponseEntity<ApiResponse<Void>> oauth2Failure(
                        @RequestParam(required = false) String error) {

                log.warn("OAuth2 login failed, error={}", error);
                throw new BusinessRuleException(
                                "Đăng nhập mạng xã hội thất bại. Vui lòng thử lại.",
                                "OAUTH2_FAILURE");
        }

        // ── Helper ────────────────────────────────────────────────────────────────

        private String extractToken(String authHeader) {
                return authHeader.startsWith("Bearer ")
                                ? authHeader.substring(7).trim()
                                : authHeader.trim();
        }

        // ── Inner DTOs ────────────────────────────────────────────────────────────

        public record RegisterResponse(UUID userId, String email, String role) {
        }

        public record VerifyEmailRequest(
                        @NotBlank @Email String email,
                        @NotBlank String code) {
        }
}