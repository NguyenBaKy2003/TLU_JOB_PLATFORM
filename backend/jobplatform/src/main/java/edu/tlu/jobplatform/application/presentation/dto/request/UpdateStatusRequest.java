package edu.tlu.jobplatform.application.presentation.dto.request;

import edu.tlu.jobplatform.application.domain.model.vo.ApplicationStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
@Schema(description = "Cập nhật trạng thái đơn ứng tuyển")
public class UpdateStatusRequest {

    @NotNull(message = "Vui lòng chọn trạng thái mới")
    @Schema(example = "SHORTLISTED")
    private ApplicationStatus status;

    @Schema(example = "Ứng viên không đáp ứng yêu cầu kinh nghiệm")
    private String note;
}