package edu.tlu.jobplatform.shared.util;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;

/**
 * Helper xử lý ngày giờ theo chuẩn Việt Nam.
 */
public final class DateUtils {

    private static final DateTimeFormatter DATE_FMT     = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter DATETIME_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    private DateUtils() {}

    /** Format date: "07/03/2026" */
    public static String formatDate(LocalDate date) {
        return date == null ? null : date.format(DATE_FMT);
    }

    /** Format datetime: "07/03/2026 14:30" */
    public static String formatDateTime(LocalDateTime dateTime) {
        return dateTime == null ? null : dateTime.format(DATETIME_FMT);
    }

    /** Kiểm tra deadline còn hạn (hôm nay hoặc sau hôm nay) */
    public static boolean isNotExpired(LocalDate deadline) {
        return deadline != null && !deadline.isBefore(LocalDate.now());
    }

    /**
     * Số ngày còn lại đến deadline.
     * Trả về 0 nếu đã hết hạn.
     */
    public static long daysUntil(LocalDate date) {
        if (date == null) return 0L;
        long days = ChronoUnit.DAYS.between(LocalDate.now(), date);
        return Math.max(0L, days);
    }

    /**
     * Chuỗi mô tả thời gian tương đối — dùng hiển thị "đăng 3 ngày trước".
     *
     * Ví dụ:
     *   30 giây trước  → "Vừa xong"
     *   45 phút trước  → "45 phút trước"
     *   2 ngày trước   → "2 ngày trước"
     */
    public static String timeAgo(LocalDateTime dateTime) {
        if (dateTime == null) return "";
        long seconds = ChronoUnit.SECONDS.between(dateTime, LocalDateTime.now());

        if (seconds < 60)       return "Vừa xong";
        if (seconds < 3600)     return (seconds / 60)   + " phút trước";
        if (seconds < 86400)    return (seconds / 3600)  + " giờ trước";
        if (seconds < 2592000)  return (seconds / 86400) + " ngày trước";
        if (seconds < 31536000) return (seconds / 2592000) + " tháng trước";
        return (seconds / 31536000) + " năm trước";
    }
}
