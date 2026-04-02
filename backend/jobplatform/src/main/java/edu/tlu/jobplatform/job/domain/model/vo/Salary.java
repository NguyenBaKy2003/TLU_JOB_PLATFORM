package edu.tlu.jobplatform.job.domain.model.vo;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

/**
 * Value Object: Mức lương.
 * Immutable — không thay đổi sau khi tạo.
 *
 * Có thể negotiate (không hiển thị con số) hoặc hiển thị khoảng min–max.
 */
@Getter
@Builder
public class Salary {

    private final BigDecimal min;
    private final BigDecimal max;
    private final String currency; // "VND", "USD"
    private final boolean negotiate; // true = "Thoả thuận", ẩn min/max

    public static Salary negotiate() {
        return Salary.builder().negotiate(true).currency("VND").build();
    }

    public static Salary of(BigDecimal min, BigDecimal max, String currency) {
        if (min != null && max != null && min.compareTo(max) > 0)
            throw new IllegalArgumentException("Lương tối thiểu không được lớn hơn tối đa.");
        return Salary.builder()
                .min(min).max(max)
                .currency(currency != null ? currency : "VND")
                .negotiate(false)
                .build();
    }

    public String display() {
        if (negotiate)
            return "Thoả thuận";
        if (min == null && max == null)
            return "Thoả thuận";
        if (min == null)
            return "Đến " + format(max) + " " + currency;
        if (max == null)
            return "Từ " + format(min) + " " + currency;
        return format(min) + " – " + format(max) + " " + currency;
    }

    private String format(BigDecimal value) {
        if (value.compareTo(BigDecimal.valueOf(1_000_000)) >= 0)
            return value.divide(BigDecimal.valueOf(1_000_000)).stripTrailingZeros().toPlainString() + "M";
        if (value.compareTo(BigDecimal.valueOf(1_000)) >= 0)
            return value.divide(BigDecimal.valueOf(1_000)).stripTrailingZeros().toPlainString() + "K";
        return value.toPlainString();
    }
}