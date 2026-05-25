package edu.tlu.jobplatform.subscription.presentation.dto.request;

import java.math.BigDecimal;

/**
 * Request body cho PATCH /api/v1/admin/candidate-plans/{planId}
 * Tất cả field nullable — PATCH semantics, chỉ update field được gửi lên.
 *
 * Ví dụ toggle active OFF: { "active": false }
 * Ví dụ toggle active ON: { "active": true }
 * Ví dụ đổi giá: { "priceMonthly": 120000, "priceYearly": 1090000 }
 * Ví dụ nâng cấp tính năng: { "aiCvWriter": true, "premiumTemplateAccess": true
 * }
 * Ví dụ tăng quota: { "applicationLimit": -1, "cvBoostLimit": 5,
 * "cvCreateLimit": -1 }
 * Ví dụ thay đổi thời hạn: { "durationDays": 365 }
 */
public record UpdateCandidatePlanRequest(
                String name,
                String description,

                /** Giá theo tháng */
                BigDecimal priceMonthly,

                /** Giá theo năm */
                BigDecimal priceYearly,

                /** Số đơn ứng tuyển / tháng. -1 = unlimited */
                Integer applicationLimit,

                /** Số lần boost CV lên top / tháng. 0 = không có */
                Integer cvBoostLimit,

                /** Số CV online có thể tạo đồng thời. -1 = unlimited */
                Integer cvCreateLimit,

                /** AI viết & tối ưu CV theo JD */
                Boolean aiCvWriter,

                /** Được dùng template premium khi tạo CV online */
                Boolean premiumTemplateAccess,

                /** Thời hạn gói (ngày). null = vĩnh viễn */
                Integer durationDays,

                /** Kích hoạt / vô hiệu hóa gói */
                Boolean active) {
        // Compact constructor validation (optional)
        public UpdateCandidatePlanRequest {
                // Validate durationDays nếu được set
                if (durationDays != null && durationDays <= 0) {
                        throw new IllegalArgumentException("durationDays must be positive or null");
                }

                // Validate applicationLimit nếu được set
                if (applicationLimit != null && applicationLimit < -1) {
                        throw new IllegalArgumentException("applicationLimit must be >= -1");
                }

                // Validate cvBoostLimit nếu được set
                if (cvBoostLimit != null && cvBoostLimit < 0) {
                        throw new IllegalArgumentException("cvBoostLimit must be >= 0");
                }

                // Validate cvCreateLimit nếu được set
                if (cvCreateLimit != null && cvCreateLimit < -1) {
                        throw new IllegalArgumentException("cvCreateLimit must be >= -1");
                }
        }
}