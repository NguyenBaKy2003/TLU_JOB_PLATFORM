package edu.tlu.jobplatform.cv.presentation.dto.request;

import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Getter
@NoArgsConstructor
public class ReorderSectionsRequest {

    /**
     * Danh sách section IDs theo thứ tự mới.
     * Phải chứa đủ tất cả section IDs hiện có của CV.
     */
    @NotEmpty(message = "Danh sách section không được để trống.")
    private List<UUID> sectionIds;
}