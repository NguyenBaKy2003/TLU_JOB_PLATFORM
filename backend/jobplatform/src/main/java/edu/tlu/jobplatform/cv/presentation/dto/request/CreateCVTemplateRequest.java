package edu.tlu.jobplatform.cv.presentation.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class CreateCVTemplateRequest {

    @NotBlank(message = "Tên template không được để trống.")
    @Size(max = 100)
    private String name;

    @Size(max = 500)
    private String thumbnailUrl;

    @Size(max = 50)
    private String category; // "professional" | "creative" | "simple"

    private boolean premium;

    /**
     * Nội dung HTML đầy đủ của template.
     * Phải là XHTML hợp lệ để Flying Saucer render được.
     * Có thể dùng Thymeleaf: th:text, th:if, th:each.
     *
     * Biến có sẵn trong context:
     * ${personalInfo} — PersonalInfo (fullName, email, phone, ...)
     * ${sections} — List<CVSection> visible, sorted by displayOrder
     * ${sectionsByType} — Map<String, List<CVSection>>
     * ${cv} — OnlineCV aggregate
     */
    @NotBlank(message = "HTML content không được để trống.")
    private String htmlContent;
}