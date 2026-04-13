package edu.tlu.jobplatform.admin.presentation.dto.response;

import edu.tlu.jobplatform.user.domain.model.User;
import edu.tlu.jobplatform.user.domain.model.UserRole;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Builder
public class AdminUserResponse {

    private final UUID id;
    private final String email;
    private final String fullName;
    private final UserRole role;
    private final boolean active;
    private final LocalDateTime createdAt;
    private final LocalDateTime lastLoginAt;

    public static AdminUserResponse from(User u) {
        return AdminUserResponse.builder()
                .id(u.getId())
                .email(u.getEmail())
                .fullName(u.getFullName())
                .role(u.getRole())
                .active(u.isActive())
                .createdAt(u.getCreatedAt())
                .lastLoginAt(u.getLastLoginAt())
                .build();
    }
}
