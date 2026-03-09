package edu.tlu.jobplatform.shared.util;

import java.text.Normalizer;
import java.util.regex.Pattern;

/**
 * Tạo URL slug từ text — hỗ trợ tiếng Việt.
 *
 * Ví dụ:
 *   "Senior Java Developer (Remote)"   → "senior-java-developer-remote"
 *   "Kỹ sư phần mềm tại Hà Nội"       → "ky-su-phan-mem-tai-ha-noi"
 *   "Lương 30-50 triệu!"              → "luong-30-50-trieu"
 */
public final class SlugUtils {

    private static final Pattern NON_LATIN  = Pattern.compile("[^\\w\\s-]");
    private static final Pattern WHITESPACE = Pattern.compile("[\\s_]+");
    private static final Pattern MULTI_DASH = Pattern.compile("-{2,}");
    private static final Pattern TRIM_DASH  = Pattern.compile("^-|-$");

    private SlugUtils() {}

    /**
     * Chuyển text thành slug URL-friendly.
     *
     * @param input text đầu vào (tiếng Việt hoặc tiếng Anh)
     * @return slug lowercase, các từ nối bằng dấu gạch ngang
     */
    public static String slugify(String input) {
        if (input == null || input.isBlank()) return "";

        // Bước 1: Chuẩn hóa Unicode — tách dấu khỏi ký tự
        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD);

        // Bước 2: Xóa dấu kết hợp (combining marks)
        String withoutAccents = normalized
            .replaceAll("\\p{InCombiningDiacriticalMarks}+", "");

        // Bước 3: Chuyển về lowercase, xóa ký tự không phải word/space/dash
        String cleaned = NON_LATIN
            .matcher(withoutAccents.toLowerCase())
            .replaceAll("");

        // Bước 4: Thay whitespace/underscore bằng dash
        String dashed = WHITESPACE.matcher(cleaned).replaceAll("-");

        // Bước 5: Thu gọn nhiều dash liên tiếp và trim đầu/cuối
        return TRIM_DASH.matcher(
            MULTI_DASH.matcher(dashed).replaceAll("-")
        ).replaceAll("");
    }

    /**
     * Tạo slug unique bằng cách thêm suffix (thường là 6 ký tự đầu UUID).
     *
     * Ví dụ: slugify("Java Developer", "a1b2c3") → "java-developer-a1b2c3"
     */
    public static String slugify(String input, String uniqueSuffix) {
        String base = slugify(input);
        if (base.isBlank()) return uniqueSuffix;
        return base + "-" + uniqueSuffix;
    }
}
