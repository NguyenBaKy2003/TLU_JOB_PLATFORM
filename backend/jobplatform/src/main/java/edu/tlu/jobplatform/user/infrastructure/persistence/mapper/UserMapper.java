package edu.tlu.jobplatform.user.infrastructure.persistence.mapper;

import edu.tlu.jobplatform.user.domain.model.User;
import edu.tlu.jobplatform.user.infrastructure.persistence.entity.UserJpaEntity;
import org.springframework.stereotype.Component;

/**
 * Chuyển đổi giữa UserJpaEntity (infrastructure) và User (domain).
 *
 * Dùng manual mapping thay vì MapStruct vì:
 * - Domain User dùng @Builder với nhiều field final
 * - Rõ ràng hơn, dễ debug khi có vấn đề mapping
 */
@Component
public class UserMapper {

    /** JPA Entity → Domain Model */
    public User toDomain(UserJpaEntity e) {
        if (e == null)
            return null;
        return User.builder()
                .id(e.getId())
                .email(e.getEmail())
                .passwordHash(e.getPasswordHash())
                .fullName(e.getFullName())
                .avatarUrl(e.getAvatarUrl())
                .role(e.getRole())
                .authProvider(e.getAuthProvider()) // ← thêm
                .authProviderId(e.getAuthProviderId()) // ← thêm
                .active(Boolean.TRUE.equals(e.getIsActive()))
                .verified(e.isVerified())
                .lastLoginAt(e.getLastLoginAt())
                .createdAt(e.getCreatedAt())
                .build();
    }

    /** Domain Model → JPA Entity (dùng cho INSERT mới — id do DB sinh) */
    public UserJpaEntity toNewEntity(User u) {
        return UserJpaEntity.builder()
                .email(u.getEmail())
                .passwordHash(u.getPasswordHash())
                .fullName(u.getFullName())
                .avatarUrl(u.getAvatarUrl())
                .role(u.getRole())
                .authProvider(u.getAuthProvider()) // ← thêm
                .authProviderId(u.getAuthProviderId()) // ← thêm
                .verified(u.isVerified())
                .lastLoginAt(u.getLastLoginAt())
                .build();
    }

    /** Cập nhật entity hiện có từ domain model (dùng cho UPDATE) */
    public void updateEntity(UserJpaEntity entity, User u) {
        entity.setEmail(u.getEmail());
        entity.setPasswordHash(u.getPasswordHash());
        entity.setFullName(u.getFullName());
        entity.setAvatarUrl(u.getAvatarUrl());
        entity.setRole(u.getRole());
        entity.setVerified(u.isVerified());
        entity.setAuthProvider(u.getAuthProvider()); // ← thêm
        entity.setAuthProviderId(u.getAuthProviderId()); // ← thêm
        entity.setLastLoginAt(u.getLastLoginAt());
        entity.setIsActive(u.isActive());
    }
}
