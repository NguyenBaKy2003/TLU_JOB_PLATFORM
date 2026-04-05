package edu.tlu.jobplatform.subscription.domain.model;

import edu.tlu.jobplatform.shared.exception.QuotaExceededException;
import lombok.Builder;
import lombok.Getter;

/**
 * Value Object theo dõi hạn mức sử dụng.
 * Immutable — mỗi thao tác trả về instance mới.
 */
@Getter
@Builder
public class Quota {

    private final int limit; // -1 = unlimited
    private final int used;

    public static Quota of(int limit) {
        return Quota.builder().limit(limit).used(0).build();
    }

    public static Quota unlimited() {
        return Quota.builder().limit(-1).used(0).build();
    }

    public int remaining() {
        if (isUnlimited())
            return Integer.MAX_VALUE;
        return Math.max(0, limit - used);
    }

    public boolean isUnlimited() {
        return limit < 0;
    }

    public boolean isExceeded() {
        return !isUnlimited() && used >= limit;
    }

    public Quota consume(int count) {
        if (!isUnlimited() && used + count > limit)
            throw new QuotaExceededException(
                    "Đã vượt quá giới hạn " + limit + " lần sử dụng.",
                    "QUOTA_EXCEEDED");
        return Quota.builder().limit(limit).used(used + count).build();
    }

    public Quota refund(int count) {
        return Quota.builder().limit(limit).used(Math.max(0, used - count)).build();
    }

    public Quota reset() {
        return Quota.builder().limit(limit).used(0).build();
    }
}
