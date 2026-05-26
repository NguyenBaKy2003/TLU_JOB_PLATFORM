// edu/tlu/jobplatform/admin/presentation/dto/request/AdminCreateUserRequest.java
package edu.tlu.jobplatform.admin.presentation.dto.request;

import edu.tlu.jobplatform.user.domain.model.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;

@Getter
public class AdminCreateUserRequest {

    @NotBlank
    @Email
    private String email;

    @NotBlank
    @Size(min = 2, max = 100)
    private String fullName;

    @NotBlank
    @Size(min = 8, max = 72)
    private String password;

    @NotNull
    private UserRole role;
}