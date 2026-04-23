package edu.tlu.jobplatform.cv.presentation.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class UpdateCVTemplateRequest {

    @NotBlank(message = "Tên template không được để trống.")
    @Size(max = 100)
    private String name;

    @Size(max = 500)
    private String thumbnailUrl;

    @Size(max = 50)
    private String category;

    private boolean premium;

    private boolean active;

    @NotBlank(message = "HTML content không được để trống.")
    private String htmlContent;
}