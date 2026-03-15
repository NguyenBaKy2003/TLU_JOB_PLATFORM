package edu.tlu.jobplatform.auth.infrastructure.adapter;

import edu.tlu.jobplatform.auth.domain.service.PasswordEncoder;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * Adapter: kết nối domain PasswordEncoder interface với Spring BCrypt.
 *
 * Sơ đồ dependency:
 *
 *   LoginUseCase
 *       │ inject
 *       ↓
 *   PasswordEncoder        ← domain interface (edu.tlu.jobplatform.auth.domain.service)
 *       ↑ implements
 *   BCryptPasswordEncoderAdapter
 *       │ inject
 *       ↓
 *   BCryptPasswordEncoder  ← Spring Security (org.springframework.security.crypto)
 *
 * Lợi ích: domain UseCase không import Spring Security.
 * Test UseCase: mock PasswordEncoder interface, không cần BCrypt thật.
 */
@Component
@RequiredArgsConstructor
public class BCryptPasswordEncoderAdapter implements PasswordEncoder {

    /** BCryptPasswordEncoder bean được khai báo trong SecurityConfig */
    private final org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder bcrypt;

    @Override
    public String encode(String rawPassword) {
        return bcrypt.encode(rawPassword);
    }

    @Override
    public boolean matches(String rawPassword, String encodedPassword) {
        return bcrypt.matches(rawPassword, encodedPassword);
    }
}
