package edu.tlu.jobplatform.application.domain.model;

import edu.tlu.jobplatform.application.domain.model.vo.ApplicationStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Lịch sử thay đổi trạng thái của đơn ứng tuyển.
 * Mỗi lần status thay đổi → ghi 1 bản ghi.
 * Không thể sửa/xóa — immutable audit trail.
 */
@Getter
@Builder
public class ApplicationStatusLog {

    private final UUID id;
    private final UUID applicationId;
    private final ApplicationStatus fromStatus;
    private final ApplicationStatus toStatus;
    private final String note; // Lý do / ghi chú
    private final UUID changedBy; // userId thực hiện
    private final LocalDateTime changedAt;
}