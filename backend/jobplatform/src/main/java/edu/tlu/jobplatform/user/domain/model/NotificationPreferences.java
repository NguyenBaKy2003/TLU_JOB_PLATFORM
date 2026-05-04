package edu.tlu.jobplatform.user.domain.model;

import lombok.Builder;
import lombok.Getter;

/**
 * Value Object: cài đặt thông báo của user.
 * Immutable — mỗi lần update tạo instance mới.
 */
@Getter
@Builder
public class NotificationPreferences {

    /** Thông báo việc làm mới phù hợp */
    private final boolean newJobs;

    /** Thông báo kết quả ứng tuyển */
    private final boolean applications;

    /** Thông báo tin nhắn từ nhà tuyển dụng */
    private final boolean messages;

    /** Default: tất cả bật */
    public static NotificationPreferences defaultPreferences() {
        return NotificationPreferences.builder()
                .newJobs(true)
                .applications(true)
                .messages(true)
                .build();
    }
}