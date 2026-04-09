package edu.tlu.jobplatform.application.presentation.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Schema(description = "Lên lịch phỏng vấn")
public class ScheduleInterviewRequest {

    @NotNull(message = "Vui lòng chọn thời gian phỏng vấn")
    @Schema(example = "2026-05-10T09:00:00")
    private LocalDateTime scheduledAt;

    @Schema(example = "Online - Google Meet: meet.google.com/abc-xyz")
    private String location;

    @Schema(example = "Phỏng vấn kỹ thuật vòng 1, khoảng 60 phút")
    private String note;
}