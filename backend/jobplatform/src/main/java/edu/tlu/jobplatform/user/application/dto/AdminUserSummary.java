package edu.tlu.jobplatform.user.application.dto;

import edu.tlu.jobplatform.user.domain.model.User;
import edu.tlu.jobplatform.user.domain.model.UserRole;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Builder
public class AdminUserSummary {

    private UUID id;
    private String email;
    private String fullName;
    private String phone;
    private String avatarUrl;
    private UserRole role;
    private String authProvider;
    private boolean active;
    private boolean verified;
    private boolean oauth2Only;
    private LocalDateTime lastLoginAt;
    private LocalDateTime createdAt;

    public static AdminUserSummary from(User u) {
        return AdminUserSummary.builder()
                .id(u.getId())
                .email(u.getEmail())
                .fullName(u.getFullName())
                .phone(u.getPhone())
                .avatarUrl(u.getAvatarUrl())
                .role(u.getRole())
                .authProvider(u.getAuthProvider())
                .active(u.isActive())
                .verified(u.isVerified())
                .oauth2Only(u.isOAuth2Only())
                .lastLoginAt(u.getLastLoginAt())
                .createdAt(u.getCreatedAt())
                .build();
    }
}