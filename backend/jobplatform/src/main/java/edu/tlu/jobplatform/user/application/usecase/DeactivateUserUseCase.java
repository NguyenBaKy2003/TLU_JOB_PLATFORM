package edu.tlu.jobplatform.user.application.usecase;

import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import edu.tlu.jobplatform.shared.exception.ResourceNotFoundException;
import edu.tlu.jobplatform.shared.security.SecurityUtils;
import edu.tlu.jobplatform.user.domain.model.User;
import edu.tlu.jobplatform.user.domain.repository.UserRepository;
import edu.tlu.jobplatform.user.infrastructure.cache.UserCacheService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * UseCase: Vô hiệu hoá tài khoản (soft delete).
 *
 * Không xóa dữ liệu thật — chỉ set active = false.
 * Dữ liệu lịch sử (job applications, audit logs...) vẫn được giữ.
 *
 * Business Rules:
 * BR-01: User tự deactivate tài khoản của mình được
 * BR-02: ADMIN có thể deactivate bất kỳ user nào
 * BR-04: Không thể deactivate tài khoản đã inactive
 * BR-05: Xóa cache và revoke tất cả session sau khi deactivate
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DeactivateUserUseCase {

        private final UserRepository userRepository;
        private final UserCacheService userCacheService;

        @Transactional
        public void execute(UUID targetUserId, String reason) {

                // BR-01 & BR-02: Chỉ owner hoặc admin mới được deactivate
                if (!SecurityUtils.isOwnerOrAdmin(targetUserId)) {
                        throw new BusinessRuleException(
                                        "Bạn không có quyền vô hiệu hoá tài khoản này.",
                                        "FORBIDDEN");
                }

                User target = userRepository.findById(targetUserId)
                                .orElseThrow(() -> ResourceNotFoundException.user(targetUserId));

                // BR-04: Không deactivate tài khoản đã inactive
                if (!target.isActive()) {
                        throw new BusinessRuleException(
                                        "Tài khoản này đã bị vô hiệu hoá rồi.",
                                        "ALREADY_INACTIVE");
                }

                // Soft delete
                target.deactivate();
                userRepository.save(target);

                // BR-05: Xóa cache
                userCacheService.evict(targetUserId);

                UUID actorId = SecurityUtils.getCurrentUserId().orElse(null);
                log.warn("User deactivated: {} | reason='{}' | by={}",
                                targetUserId, reason, actorId);
        }
}