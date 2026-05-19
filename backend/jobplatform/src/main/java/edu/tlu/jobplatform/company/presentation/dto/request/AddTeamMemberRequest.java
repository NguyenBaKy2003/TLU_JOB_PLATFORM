package edu.tlu.jobplatform.company.presentation.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "Thêm thành viên đội ngũ")
public record AddTeamMemberRequest(

                @NotBlank(message = "Tên không được để trống") @Size(max = 150) @Schema(example = "Nguyễn Văn A") String fullName,

                @Size(max = 150) @Schema(example = "CEO") String jobTitle,

                @Size(max = 1000) @Schema(example = "Hơn 10 năm kinh nghiệm trong lĩnh vực công nghệ...") String bio,

                @Size(max = 500) @Schema(example = "https://linkedin.com/in/nguyenvana") String linkedinUrl,

                @Schema(example = "0", description = "Thứ tự hiển thị, -1 = cuối danh sách") int displayOrder) {
}