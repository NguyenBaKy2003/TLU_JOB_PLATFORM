package edu.tlu.jobplatform.user.infrastructure.persistence.mapper;

import edu.tlu.jobplatform.user.domain.model.User;
import edu.tlu.jobplatform.user.infrastructure.persistence.entity.UserJpaEntity;
import org.springframework.stereotype.Component;

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
                .authProvider(e.getAuthProvider())
                .authProviderId(e.getAuthProviderId())
                .active(e.isActive()) // từ BaseJpaEntity
                .verified(e.isVerified())
                .failedLoginAttempts(e.getFailedLoginAttempts())
                .lockedUntil(e.getLockedUntil())
                .lastLoginAt(e.getLastLoginAt())
                .createdAt(e.getCreatedAt())
                .build();
    }

    /** Domain → Entity mới (INSERT) */
    public UserJpaEntity toNewEntity(User u) {
        UserJpaEntity e = new UserJpaEntity();
        e.setEmail(u.getEmail());
        e.setPasswordHash(u.getPasswordHash());
        e.setFullName(u.getFullName());
        e.setAvatarUrl(u.getAvatarUrl());
        e.setRole(u.getRole());
        e.setAuthProvider(u.getAuthProvider());
        e.setAuthProviderId(u.getAuthProviderId());
        e.setIsActive(u.isActive()); // từ BaseJpaEntity
        e.setVerified(u.isVerified());
        e.setFailedLoginAttempts(u.getFailedLoginAttempts());
        e.setLockedUntil(u.getLockedUntil());
        e.setLastLoginAt(u.getLastLoginAt());
        return e;
    }

    /** Domain → Entity hiện có (UPDATE) */
    public void updateEntity(UserJpaEntity e, User u) {
        e.setEmail(u.getEmail());
        e.setPasswordHash(u.getPasswordHash());
        e.setFullName(u.getFullName());
        e.setAvatarUrl(u.getAvatarUrl());
        e.setRole(u.getRole());
        e.setAuthProvider(u.getAuthProvider());
        e.setAuthProviderId(u.getAuthProviderId());
        e.setIsActive(u.isActive()); // từ BaseJpaEntity
        e.setVerified(u.isVerified());
        e.setFailedLoginAttempts(u.getFailedLoginAttempts());
        e.setLockedUntil(u.getLockedUntil());
        e.setLastLoginAt(u.getLastLoginAt());
    }
}