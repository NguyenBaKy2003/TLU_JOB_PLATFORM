package edu.tlu.jobplatform.auth.presentation;

import edu.tlu.jobplatform.auth.presentation.dto.AdminSetupResponse;
import edu.tlu.jobplatform.auth.presentation.dto.RegisterRequest;
import edu.tlu.jobplatform.shared.response.ApiResponse;
import edu.tlu.jobplatform.user.domain.model.User;
import edu.tlu.jobplatform.user.domain.model.UserRole;
import edu.tlu.jobplatform.user.domain.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import software.amazon.awssdk.services.s3.S3Client;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/admin")
public class AdminSetupController {

        private final UserRepository userRepository;
        private final PasswordEncoder passwordEncoder;
        private final S3Client s3Client;
        @Value("${admin.setup.secret}")
        private String setupSecret;

        @PostMapping("/setup")
        public ResponseEntity<ApiResponse<AdminSetupResponse>> setupAdminAccount(
                        @RequestHeader("Setup-Secret") String requestSecret,
                        @Valid @RequestBody RegisterRequest request) {

                // Không log secret — chỉ log kết quả xác thực
                if (!setupSecret.equals(requestSecret)) {
                        log.warn("Setup secret mismatch — unauthorized setup attempt");
                        return ResponseEntity.status(403)
                                        .body(ApiResponse.error("Invalid setup secret"));
                }

                if (userRepository.findByEmail(request.getEmail()).isPresent()) {
                        log.warn("Admin setup: email already in use [{}]", request.getEmail());
                        return ResponseEntity.badRequest()
                                        .body(ApiResponse.error("Email already in use"));
                }

                User admin = User.builder()
                                .email(request.getEmail())
                                .fullName(request.getFullName())
                                .passwordHash(passwordEncoder.encode(request.getPassword()))
                                .role(UserRole.ADMIN)
                                .active(true)
                                .verified(true) // admin không cần verify email
                                .build();

                User saved = userRepository.save(admin);

                AdminSetupResponse response = AdminSetupResponse.builder()
                                .id(saved.getId())
                                .email(saved.getEmail())
                                .fullName(saved.getFullName())
                                .role(saved.getRole())
                                .build();

                log.info("Admin account created: [{}]", saved.getEmail());
                return ResponseEntity.ok(ApiResponse.success(response, "Admin account created successfully"));
        }

        @GetMapping("/test-s3")
        public ResponseEntity<String> testS3(
                        @RequestHeader("Setup-Secret") String secret) {

                if (!setupSecret.equals(secret))
                        return ResponseEntity.status(403).body("Forbidden");

                try {
                        s3Client.listBuckets();
                        return ResponseEntity.ok("S3 connected successfully");
                } catch (Exception e) {
                        return ResponseEntity.status(500).body("S3 error: " + e.getMessage());
                }
        }
}