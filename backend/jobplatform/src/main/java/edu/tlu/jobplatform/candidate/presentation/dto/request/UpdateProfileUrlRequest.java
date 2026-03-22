package edu.tlu.jobplatform.candidate.presentation.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class UpdateProfileUrlRequest {

    @NotBlank(message = "Slug không được để trống")
    @Pattern(regexp = "^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$", message = "Slug chỉ dùng chữ thường, số và dấu gạch ngang (3-30 ký tự)")
    private String slug;
}