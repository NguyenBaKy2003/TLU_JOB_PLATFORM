package edu.tlu.jobplatform.subscription.presentation.dto.request;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;

/**
 * Request body cho POST /api/v1/admin/candidate-plans
 * 
 * Ví dụ gói FREE_CANDIDATE (miễn phí):
 * {
 * "code": "FREE_CANDIDATE",
 * "name": "Gói Cơ Bản",
 * "description": "Miễn phí, 5 đơn/tháng, tạo 1 CV, template thường",
 * "priceMonthly": null,
 * "priceYearly": null,
 * "applicationLimit": 5,
 * "cvBoostLimit": 0,
 * "cvCreateLimit": 1,
 * "aiCvWriter": false,
 * "premiumTemplateAccess": false,
 * "durationDays": null,
 * "free": true,
 * "active": true
 * }
 * 
 * Ví dụ gói PRO:
 * {
 * "code": "PRO",
 * "name": "Gói Chuyên Nghiệp",
 * "description": "99k/tháng, unlimited apply, boost CV, tạo 5 CV, template
 * premium",
 * "priceMonthly": 99000,
 * "priceYearly": 899000,
 * "applicationLimit": -1,
 * "cvBoostLimit": 3,
 * "cvCreateLimit": 5,
 * "aiCvWriter": false,
 * "premiumTemplateAccess": true,
 * "durationDays": 30,
 * "free": false,
 * "active": true
 * }
 * 
 * Ví dụ gói PREMIUM:
 * {
 * "code": "PREMIUM",
 * "name": "Gói Cao Cấp",
 * "description": "199k/tháng, tất cả Pro + AI viết CV, tạo unlimited CV,
 * template premium",
 * "priceMonthly": 199000,
 * "priceYearly": 1799000,
 * "applicationLimit": -1,
 * "cvBoostLimit": 10,
 * "cvCreateLimit": -1,
 * "aiCvWriter": true,
 * "premiumTemplateAccess": true,
 * "durationDays": 30,
 * "free": false,
 * "active": true
 * }
 */
public record CreateCandidatePlanRequest(
                @NotBlank @Size(max = 30) String code,

                @NotBlank @Size(max = 100) String name,

                String description,

                /** null nếu là gói free */
                @DecimalMin("0") BigDecimal priceMonthly,

                @DecimalMin("0") BigDecimal priceYearly,

                /** Số đơn ứng tuyển / tháng. -1 = unlimited */
                @Min(-1) int applicationLimit,

                /** Số lần boost CV lên top / tháng. 0 = không có */
                @Min(0) int cvBoostLimit,

                /** Số CV online có thể tạo đồng thời. -1 = unlimited */
                @Min(-1) int cvCreateLimit,

                /** AI viết & tối ưu CV theo JD — chỉ PREMIUM */
                boolean aiCvWriter,

                /** Được dùng template premium khi tạo CV online */
                boolean premiumTemplateAccess,

                /** null nếu gói free không có thời hạn */
                Integer durationDays,

                /** Gói có đang active không */
                boolean active,

                /** Đánh dấu gói miễn phí */
                boolean free) {
        // Compact constructor validation (optional)
        public CreateCandidatePlanRequest {
                // Validate logic: nếu là gói free thì price phải null
                if (free && (priceMonthly != null || priceYearly != null)) {
                        throw new IllegalArgumentException("Free plan cannot have price");
                }

                // Validate: nếu không phải free thì phải có priceMonthly
                if (!free && priceMonthly == null) {
                        throw new IllegalArgumentException("Paid plan must have priceMonthly");
                }

                // Validate: nếu là free và không có durationDays thì phải là null (vĩnh viễn)
                if (free && durationDays != null) {
                        throw new IllegalArgumentException(
                                        "Free plan should not have durationDays (set null for permanent)");
                }

                // Validate: code phải là 1 trong 3 giá trị hợp lệ
                if (!code.equals("FREE_CANDIDATE") && !code.equals("PRO") && !code.equals("PREMIUM")) {
                        throw new IllegalArgumentException("Code must be one of: FREE_CANDIDATE, PRO, PREMIUM");
                }
        }
}