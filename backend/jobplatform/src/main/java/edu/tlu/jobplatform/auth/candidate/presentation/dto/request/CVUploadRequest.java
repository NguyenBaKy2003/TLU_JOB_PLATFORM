package edu.tlu.jobplatform.auth.candidate.presentation.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CVUploadRequest {

    @Size(max = 255, message = "Tiêu đề tối đa 255 ký tự")
    private String title;

    private Boolean setAsPrimary;
}