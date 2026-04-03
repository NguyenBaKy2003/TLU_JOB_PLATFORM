package edu.tlu.jobplatform.job.domain.model.vo;

import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

/**
 * Value Object đại diện cho mức lương.
 * Immutable — so sánh bằng giá trị, không có id riêng.
 *
 * Lương có thể là:
 * - Khoảng: min=10tr, max=20tr
 * - Cố định: min=max=15tr
 * - Thoả thuận: negotiable=true (min/max null)
 */
@Getter
@Builder
public class Salary {

    private final BigDecimal min;
    private final BigDecimal max;
    private final String currency; // "VND", "USD"
    private final boolean negotiable; // Thoả thuận

    public static Salary negotiable() {
        return Salary.builder().negotiable(true).currency("VND").build();
    }

    public static Salary of(BigDecimal min, BigDecimal max, String currency) {
        if (min != null && max != null && min.compareTo(max) > 0)
            throw new BusinessRuleException(
                    "Lương tối thiểu không được lớn hơn lương tối đa.", "INVALID_SALARY_RANGE");
        if (min != null && min.compareTo(BigDecimal.ZERO) < 0)
            throw new BusinessRuleException("Lương không được âm.", "INVALID_SALARY");
        return Salary.builder().min(min).max(max)
                .currency(currency != null ? currency : "VND").negotiable(false).build();
    }

    /** Hiển thị mức lương dạng string */
    public String display() {
        if (negotiable)
            return "Thoả thuận";
        String cur = "VND".equals(currency) ? "đ" : currency;
        if (min != null && max != null && min.compareTo(max) == 0)
            return String.format("%,.0f %s", min, cur);
        if (min != null && max != null)
            return String.format("%,.0f - %,.0f %s", min, max, cur);
        if (min != null)
            return String.format("Từ %,.0f %s", min, cur);
        if (max != null)
            return String.format("Đến %,.0f %s", max, cur);
        return "Thoả thuận";
    }
}