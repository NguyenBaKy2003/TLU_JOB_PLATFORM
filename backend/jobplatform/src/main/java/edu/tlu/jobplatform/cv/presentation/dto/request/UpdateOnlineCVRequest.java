package edu.tlu.jobplatform.cv.presentation.dto.request;

import edu.tlu.jobplatform.cv.domain.model.vo.CVVisibility;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Getter
@NoArgsConstructor
public class UpdateOnlineCVRequest {

    @NotBlank(message = "Tiêu đề CV không được để trống.")
    @Size(max = 200)
    private String title;

    @Valid
    private PersonalInfoRequest personalInfo;

    @NotNull(message = "templateId không được để trống.")
    private UUID templateId;

    @NotNull(message = "visibility không được để trống.")
    private CVVisibility visibility;
}