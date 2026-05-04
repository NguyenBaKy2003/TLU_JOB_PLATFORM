package edu.tlu.jobplatform.user.application.port.out;

import edu.tlu.jobplatform.user.domain.model.NotificationPreferences;

import java.util.UUID;

/**
 * Output Port để lưu/đọc cài đặt thông báo của user.
 *
 * Implementation: JPA entity hoặc JSON column trong bảng users.
 */
public interface NotificationPreferencesPort {

    /**
     * Lưu (upsert) cài đặt thông báo.
     */
    void save(UUID userId, NotificationPreferences preferences);

    /**
     * Lấy cài đặt thông báo.
     * Trả về default (tất cả bật) nếu chưa có record.
     */
    NotificationPreferences findByUserId(UUID userId);
}