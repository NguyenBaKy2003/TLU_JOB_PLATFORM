package edu.tlu.jobplatform.cv.presentation.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Getter
@NoArgsConstructor
public class CreateOnlineCVRequest {

    @NotBlank(message = "Tiêu đề CV không được để trống.")
    @Size(max = 200, message = "Tiêu đề tối đa 200 ký tự.")
    private String title;

    /** null = dùng template miễn phí đầu tiên */
    private UUID templateId;
}