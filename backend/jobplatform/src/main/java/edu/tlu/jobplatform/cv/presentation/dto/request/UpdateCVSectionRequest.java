package edu.tlu.jobplatform.cv.presentation.dto.request;

import edu.tlu.jobplatform.cv.domain.model.vo.SectionType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * Dùng cho cả add mới và cập nhật section.
 * - Add mới (POST /sections): type bắt buộc, sectionId = null
 * - Update (PUT /sections/{sectionId}): type không cần thiết (bị ignore)
 */
@Getter
@NoArgsConstructor
public class UpdateCVSectionRequest {

    /** Bắt buộc khi tạo mới section; ignore khi update */
    private SectionType type;

    @NotBlank(message = "Tiêu đề section không được để trống.")
    @Size(max = 150)
    private String title;

    /**
     * Nội dung JSON theo schema của từng SectionType.
     * Không validate schema ở đây — domain service chịu trách nhiệm.
     */
    @NotNull(message = "Nội dung section không được null.")
    private String content;

    private boolean visible = true;
}