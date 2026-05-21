package edu.tlu.jobplatform.subscription.domain.model;

import edu.tlu.jobplatform.shared.exception.QuotaExceededException;
import lombok.Builder;
import lombok.Getter;

/**
 * Value Object theo dõi hạn mức sử dụng cho Candidate.
 *
 * Immutable — mỗi thao tác trả về instance mới.
 *
 * Khác với Quota (Company) ở chỗ:
 * - Một số quota reset hàng tháng (application, cvBoost)
 * - Một số quota là one-time dùng hết trong kỳ (mockInterview)
 * - Vẫn hỗ trợ -1 = unlimited cho gói PREMIUM
 *
 * Dùng class riêng thay vì kế thừa Quota để tránh coupling với
 * Company domain và dễ thêm logic reset sau này.
 */
@Getter
@Builder
public class CandidateQuota {

    private final int limit; // -1 = unlimited
    private final int used;

    public static CandidateQuota of(int limit) {
        return CandidateQuota.builder().limit(limit).used(0).build();
    }

    public static CandidateQuota unlimited() {
        return CandidateQuota.builder().limit(-1).used(0).build();
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

    public CandidateQuota consume(int count) {
        if (!isUnlimited() && used + count > limit)
            throw new QuotaExceededException(
                    "Đã vượt quá giới hạn " + limit + " lần sử dụng.",
                    "CANDIDATE_QUOTA_EXCEEDED");
        return CandidateQuota.builder().limit(limit).used(used + count).build();
    }

    public CandidateQuota refund(int count) {
        return CandidateQuota.builder().limit(limit).used(Math.max(0, used - count)).build();
    }

    /**
     * Reset về 0 — dùng cho scheduler reset hàng tháng.
     * Giữ nguyên limit, chỉ reset used.
     */
    public CandidateQuota reset() {
        return CandidateQuota.builder().limit(limit).used(0).build();
    }
}