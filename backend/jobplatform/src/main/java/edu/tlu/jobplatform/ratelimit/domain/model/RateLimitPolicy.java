package edu.tlu.jobplatform.ratelimit.domain.model;

import lombok.Builder;
import lombok.Getter;

/**
 * Mô tả một policy rate limit.
 * Immutable — tạo 1 lần từ config, dùng lại nhiều lần.
 */
@Getter
@Builder
public class RateLimitPolicy {

    private final String name; // e.g. "send-message"
    private final int maxRequests; // số request tối đa trong window
    private final int windowSeconds; // kích thước cửa sổ thời gian (giây)
    private final Scope scope; // IP hoặc USER

    public enum Scope {
        IP, // key = ip address
        USER // key = userId (yêu cầu đã xác thực)
    }
}