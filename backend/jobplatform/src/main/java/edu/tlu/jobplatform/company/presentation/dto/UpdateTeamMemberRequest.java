package edu.tlu.jobplatform.company.presentation.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "Cập nhật thành viên đội ngũ")
public record UpdateTeamMemberRequest(

        @NotBlank(message = "Tên không được để trống") @Size(max = 150) String fullName,

        @Size(max = 150) String jobTitle,

        @Size(max = 1000) String bio,

        @Size(max = 500) String linkedinUrl,

        int displayOrder) {
}