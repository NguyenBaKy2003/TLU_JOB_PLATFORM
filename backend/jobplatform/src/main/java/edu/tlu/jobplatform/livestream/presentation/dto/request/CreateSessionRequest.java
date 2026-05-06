package edu.tlu.jobplatform.livestream.presentation.dto.request;

import edu.tlu.jobplatform.livestream.domain.model.vo.SessionType;
import jakarta.validation.constraints.*;

import java.util.List;

//  CreateSessionRequest ─
import java.time.OffsetDateTime;

public record CreateSessionRequest(
                @NotBlank(message = "Tiêu đề không được để trống") @Size(max = 200) String title,

                String description,

                @NotNull(message = "Loại phiên không được để trống") SessionType sessionType,

                @NotNull(message = "Thời gian bắt đầu không được để trống") @Future(message = "Thời gian bắt đầu phải ở tương lai") OffsetDateTime scheduledAt,

                List<InterviewSlotRequest> interviewSlots) {
}
