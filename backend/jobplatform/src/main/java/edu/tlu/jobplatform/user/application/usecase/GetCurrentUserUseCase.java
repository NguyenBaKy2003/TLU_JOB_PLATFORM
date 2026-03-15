package edu.tlu.jobplatform.user.application.usecase;

import edu.tlu.jobplatform.shared.exception.ResourceNotFoundException;
import edu.tlu.jobplatform.user.domain.model.User;
import edu.tlu.jobplatform.user.domain.repository.UserRepository;
import edu.tlu.jobplatform.user.infrastructure.cache.UserCacheService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * UseCase: Lấy thông tin user đang đăng nhập.
 *
 * Được gọi từ:
 * - GET /api/users/me — frontend load profile sau khi login
 * - Các domain khác cần thông tin user (Candidate, Company...)
 *
 * Luồng:
 * 1. Tìm trong Redis cache (TTL 10 phút)
 * 2. Cache miss → query PostgreSQL
 * 3. Write-through vào cache
 * 4. Trả về domain User
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class GetCurrentUserUseCase {

    private final UserRepository userRepository;
    private final UserCacheService userCacheService;

    @Transactional(readOnly = true)
    public User execute(UUID userId) {
        // Cache-aside pattern: thử cache trước
        return userCacheService.get(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> ResourceNotFoundException.user(userId));

                    // Write-through vào cache
                    userCacheService.put(user);
                    return user;
                });
    }
}