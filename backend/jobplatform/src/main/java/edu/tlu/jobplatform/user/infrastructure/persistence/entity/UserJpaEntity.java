package edu.tlu.jobplatform.user.infrastructure.persistence.entity;

import edu.tlu.jobplatform.shared.base.BaseJpaEntity;
import edu.tlu.jobplatform.user.domain.model.UserRole;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * JPA Entity map với bảng "users" trong PostgreSQL.
 *
 * Tách biệt khỏi domain User:
 * - Entity này biết về DB (@Column, indexes, JPA lifecycle)
 * - Domain User không biết DB tồn tại
 *
 * UserMapper chuyển đổi giữa hai: UserJpaEntity ↔ User (domain)
 */
@Entity
@Table(name = "users", indexes = {
        @Index(name = "idx_users_email", columnList = "email", unique = true),
        @Index(name = "idx_users_role", columnList = "role"),
        @Index(name = "idx_users_active", columnList = "is_active"),
        @Index(name = "idx_users_provider", columnList = "auth_provider")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserJpaEntity extends BaseJpaEntity {

    @Column(nullable = false, unique = true, length = 255)
    private String email;

    @Column(name = "password_hash", length = 255)
    private String passwordHash;

    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;

    @Column(name = "avatar_url", length = 500)
    private String avatarUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private UserRole role;

    @Column(name = "auth_provider", length = 50)
    private String authProvider; // ← thêm

    @Column(name = "auth_provider_id", length = 255)
    private String authProviderId; // ← thêm

    @Column(name = "is_verified", nullable = false)
    private boolean verified;

    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt;
}
