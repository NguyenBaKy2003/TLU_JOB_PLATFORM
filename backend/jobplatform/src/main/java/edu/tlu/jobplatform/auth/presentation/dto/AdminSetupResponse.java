package edu.tlu.jobplatform.auth.presentation.dto;

import edu.tlu.jobplatform.user.domain.model.UserRole;
import lombok.Builder;
import lombok.Getter;

import java.util.UUID;

@Getter
@Builder
public class AdminSetupResponse {
    private UUID id;
    private String email;
    private String fullName;
    private String phone;
    private UserRole role;
}