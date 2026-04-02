package edu.tlu.jobplatform.subscription.domain.model;

import lombok.Builder;
import lombok.Getter;

/**
 * Value Object: Theo dõi giới hạn sử dụng của một loại resource.
 *
 * Immutable — mỗi lần consume/reset trả về Quota mới.
 *
 * Ví dụ:
 * Quota jobQuota = Quota.of(20, 0); // 20 limit, 0 đã dùng
 * jobQuota = jobQuota.consume(1); // dùng 1 → used=1
 * jobQuota.isExceeded(); // false (1 < 20)
 */
@Getter
@Builder
public class Quota {

    private final int limit; // Giới hạn tối đa (-1 = unlimited)
    private final int used; // Đã sử dụng

    public static Quota of(int limit, int used) {
        return Quota.builder().limit(limit).used(used).build();
    }

    public static Quota unlimited() {
        return Quota.builder().limit(-1).used(0).build();
    }

    // ── Business Rules ────────────────────────────────────────

    public boolean isUnlimited() {
        return limit < 0;
    }

    public boolean isExceeded() {
        return !isUnlimited() && used >= limit;
    }

    public int remaining() {
        return isUnlimited() ? Integer.MAX_VALUE : Math.max(0, limit - used);
    }

    /** Trả về Quota mới sau khi tiêu thụ amount đơn vị */
    public Quota consume(int amount) {
        return Quota.of(limit, used + amount);
    }

    /** Reset về 0 — dùng khi gia hạn subscription */
    public Quota reset() {
        return Quota.of(limit, 0);
    }

    /** Cập nhật limit mới (khi upgrade plan) */
    public Quota withLimit(int newLimit) {
        return Quota.of(newLimit, used);
    }
}