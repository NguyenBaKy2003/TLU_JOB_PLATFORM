package edu.tlu.jobplatform.shared.validation;

import jakarta.validation.Constraint;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import jakarta.validation.Payload;

import java.lang.annotation.*;

/**
 * Custom validation annotation kiểm tra số điện thoại Việt Nam.
 *
 * Chấp nhận:
 *   0912345678   (10 số, bắt đầu 0)
 *   +84912345678 (quốc tế)
 *   84912345678  (quốc tế không có +)
 *
 * Đầu số hợp lệ: 03x, 05x, 07x, 08x, 09x
 *
 * Cách dùng:
 * <pre>
 *   {@literal @}ValidPhone
 *   private String phone;
 * </pre>
 */
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Constraint(validatedBy = PhoneNumberValidator.Validator.class)
public @interface PhoneNumberValidator {

    String message() default "Số điện thoại không hợp lệ (VD: 0912345678 hoặc +84912345678)";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};

    // ── Validator implementation ──────────────────────────────────

    class Validator implements ConstraintValidator<PhoneNumberValidator, String> {

        /**
         * Regex SĐT Việt Nam:
         *   (\\+84|84|0) → prefix
         *   (3[2-9]|5[6-9]|7[0-9]|8[0-9]|9[0-9]) → đầu số nhà mạng
         *   [0-9]{7} → 7 số cuối
         */
        private static final String VN_PHONE_REGEX =
            "^(\\+84|84|0)(3[2-9]|5[6-9]|7[0-9]|8[0-9]|9[0-9])[0-9]{7}$";

        @Override
        public boolean isValid(String value, ConstraintValidatorContext ctx) {
            // null để @NotNull xử lý riêng, blank cũng tương tự
            if (value == null || value.isBlank()) return true;
            return value.replaceAll("\\s", "").matches(VN_PHONE_REGEX);
        }
    }
}
