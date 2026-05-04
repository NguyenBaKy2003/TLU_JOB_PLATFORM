package edu.tlu.jobplatform.candidate.presentation.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateOnlineCVRequest {

    @NotBlank(message = "Tiêu đề CV không được để trống")
    @Size(max = 255, message = "Tiêu đề tối đa 255 ký tự")
    private String title;

    @Size(max = 50000, message = "Nội dung CV quá dài")
    private String content;
}