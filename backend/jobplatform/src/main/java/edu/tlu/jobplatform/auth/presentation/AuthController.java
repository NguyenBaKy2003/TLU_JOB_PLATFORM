package edu.tlu.jobplatform.auth.presentation;

import edu.tlu.jobplatform.auth.application.usecase.*;
import edu.tlu.jobplatform.auth.domain.model.AuthToken;
import edu.tlu.jobplatform.auth.presentation.dto.*;
import edu.tlu.jobplatform.ratelimit.domain.model.RateLimitPolicy;
import edu.tlu.jobplatform.ratelimit.presentation.annotation.RateLimit;
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
import org.springframework.web.util.UriComponentsBuilder;

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
        private final ResetPasswordUseCase resetPasswordUseCase;
        private final ForgotPasswordUseCase forgotPasswordUseCase;
        private final ResendOtpUseCase resendOtpUseCase;
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
        public ResponseEntity<ApiResponse<TokenResponse>> verifyEmail(
                        @Valid @RequestBody VerifyEmailRequest req) {

                AuthToken token = verifyEmailUseCase.execute(
                                new VerifyEmailUseCase.Command(req.email(), req.code()));

                return ResponseEntity.ok(ApiResponse.success(
                                TokenResponse.from(token),
                                "Xác thực thành công! Đang đăng nhập..."));
        }
        // ── POST /api/v1/auth/resend-otp ──────────────────────────────────────────

        @Operation(summary = "Gửi lại mã OTP xác thực email", description = """
                        Gửi lại OTP 6 số nếu mã cũ đã hết hạn hoặc bị mất.

                        OTP cũ sẽ bị **ghi đè** — chỉ mã mới nhất có hiệu lực.
                        Mã có hiệu lực trong **10 phút**.

                        **Bảo mật:** Response luôn trả về thành công dù email không tồn tại
                        (tương tự forgot-password, tránh dò tìm email).
                        """)
        @ApiResponses({
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OTP đã được gửi lại (nếu email hợp lệ và chưa verified)"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Email sai định dạng")
        })
        @PostMapping("/resend-otp")
        @RateLimit(policy = "register-otp", scope = RateLimitPolicy.Scope.IP)
        public ResponseEntity<ApiResponse<Void>> resendOtp(
                        @Valid @RequestBody ResendOtpRequest req) {

                try {
                        resendOtpUseCase.execute(req.email());
                } catch (BusinessRuleException e) {
                        // Không lộ lý do thất bại (user not found / already verified)
                        log.debug("resendOtp silenced: code={} email={}", e.getErrorCode(), req.email());
                }

                return ResponseEntity.ok(ApiResponse.success(
                                "Nếu email này hợp lệ và chưa xác thực, bạn sẽ nhận được mã OTP mới trong vài phút."));
        }

        // ── POST /api/v1/auth/login ───────────────────────────────────────────────

        @Operation(summary = "Đăng nhập", description = "Đăng nhập bằng email/password. Trả về JWT access token (15p) và refresh token (30 ngày).")
        @ApiResponses({
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Đăng nhập thành công"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "422", description = "Sai credentials / Chưa xác thực email / Bị khóa")
        })
        @PostMapping("/login")
        @RateLimit(policy = "login", scope = RateLimitPolicy.Scope.IP)
        @Loggable(action = "USER_LOGIN", resourceType = "User")
        public ResponseEntity<ApiResponse<TokenResponse>> login(
                        @Valid @RequestBody LoginRequest req) {

                AuthToken token = loginUseCase.execute(
                                new LoginUseCase.Command(
                                                req.getEmail(),
                                                req.getPassword(),
                                                req.getPortalType()));

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

        // ── POST /api/auth/forgot-password ───────────────────────────

        @Operation(summary = "Quên mật khẩu — gửi link đặt lại qua email", description = """
                        Gửi email chứa link đặt lại mật khẩu (hết hạn sau **15 phút**).

                        **Bảo mật:** Response luôn trả về thành công dù email không tồn tại.
                        Điều này ngăn kẻ tấn công dò tìm email đã đăng ký.

                        **Kiểm tra link** trong môi trường dev: xem log console.
                        """)
        @ApiResponses({
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Đã gửi email (nếu email tồn tại)"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Email sai định dạng")
        })
        @PostMapping("/forgot-password")
        public ResponseEntity<ApiResponse<Void>> forgotPassword(
                        @Valid @RequestBody ForgotPasswordRequest req) {

                forgotPasswordUseCase.execute(req.getEmail());

                // Luôn trả về cùng message — không tiết lộ email có tồn tại không
                return ResponseEntity.ok(ApiResponse.success(
                                "Nếu email này đã đăng ký, bạn sẽ nhận được link đặt lại mật khẩu trong vài phút."));
        }

        // ── POST /api/auth/reset-password ────────────────────────────

        @Operation(summary = "Đặt lại mật khẩu bằng reset token", description = """
                        Đặt mật khẩu mới bằng token nhận được qua email.

                        **Lấy tham số:** Từ link email dạng:
                        `/reset-password?token={token}&userId={userId}`

                        **Sau khi đặt lại:**
                        - Tất cả phiên đăng nhập trên mọi thiết bị bị thu hồi
                        - User cần đăng nhập lại bằng mật khẩu mới

                        **Mật khẩu yêu cầu:** ≥8 ký tự, ít nhất 1 chữ hoa, 1 chữ thường, 1 số.
                        """)
        @ApiResponses({
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Đặt lại mật khẩu thành công"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Dữ liệu không hợp lệ"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "422", description = "Token hết hạn / không hợp lệ / mật khẩu yếu / trùng mật khẩu cũ")
        })
        @PostMapping("/reset-password")
        @Loggable(action = "PASSWORD_RESET", resourceType = "User")
        public ResponseEntity<ApiResponse<Void>> resetPassword(
                        @Valid @RequestBody ResetPasswordRequest req) {

                resetPasswordUseCase.execute(
                                new ResetPasswordUseCase.Command(
                                                req.getUserId(),
                                                req.getToken(),
                                                req.getNewPassword()));

                return ResponseEntity.ok(ApiResponse.success(
                                "Mật khẩu đã được đặt lại thành công. Vui lòng đăng nhập lại."));
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
        @Operation(summary = "Lấy OAuth2 authorization URL", description = """
                        Trả về URL để frontend redirect sang Google/Facebook.

                        **portal** xác định ngữ cảnh đăng nhập:
                        - `CANDIDATE` (default) — trang ứng viên
                        - `EMPLOYER` — trang nhà tuyển dụng

                        Backend gắn `portal` vào URL dưới dạng query param `?portal=EMPLOYER`.
                        `CustomAuthorizationRequestResolver` đọc param này và lưu vào HttpSession
                        để persist qua toàn bộ OAuth2 roundtrip (redirect → Google → callback).
                        """)
        @GetMapping("/oauth2/url/{provider}")
        public ResponseEntity<ApiResponse<Map<String, String>>> getOAuth2Url(
                        @PathVariable String provider,
                        @RequestParam(defaultValue = "CANDIDATE") String portal) { // ← thêm param portal

                List<String> supported = List.of("google", "facebook");
                if (!supported.contains(provider.toLowerCase())) {
                        throw new BusinessRuleException(
                                        "Provider không hỗ trợ: " + provider + ". Hỗ trợ: " + supported,
                                        "UNSUPPORTED_PROVIDER");
                }

                // Validate portal value
                List<String> validPortals = List.of("CANDIDATE", "EMPLOYER", "ADMIN");
                String normalizedPortal = portal.toUpperCase().trim();
                if (!validPortals.contains(normalizedPortal)) {
                        throw new BusinessRuleException(
                                        "Portal không hợp lệ: " + portal + ". Hỗ trợ: " + validPortals,
                                        "INVALID_PORTAL");
                }

                // Gắn portal vào URL dưới dạng query param "portal" — KHÔNG dùng "state"
                // vì Spring Security sẽ ghi đè "state" bằng CSRF token của nó.
                // CustomAuthorizationRequestResolver đọc "portal" param và lưu vào session.
                String url = UriComponentsBuilder
                                .fromUriString(baseUrl + "/oauth2/authorization/" + provider.toLowerCase())
                                .queryParam("portal", normalizedPortal)
                                .build().toUriString();

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

        // ── Helper ─

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

        public record ResendOtpRequest(
                        @NotBlank @Email String email) {
        }
}