package edu.tlu.jobplatform.candidate.domain.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import edu.tlu.jobplatform.candidate.domain.repository.CandidateProfileRepository;

import java.text.Normalizer;
import java.util.UUID;
import java.util.regex.Pattern;

/**
 * Domain service sinh và validate profileUrl.
 *
 * Format: joblin.com/u/{slug}
 * Slug rules:
 * - Chỉ chứa a-z, 0-9, dấu gạch ngang
 * - 3–30 ký tự
 * - Không bắt đầu/kết thúc bằng dấu gạch ngang
 */
@Service
@RequiredArgsConstructor
public class ProfileUrlService {

    private static final Pattern SLUG_PATTERN = Pattern.compile("^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$");
    private static final Pattern NON_SLUG_CHARS = Pattern.compile("[^a-z0-9-]");
    private static final Pattern CONSECUTIVE_DASH = Pattern.compile("-{2,}");
    private static final String BASE_URL = "joblin.com/u/";

    private final CandidateProfileRepository profileRepository;

    // ── Generate ──────────────────

    /**
     * Tự động sinh slug từ firstName + lastName.
     * Nếu slug bị trùng → thêm số ngẫu nhiên phía sau.
     *
     * Ví dụ: "Minh Hằng" → "minh-hang" → nếu trùng → "minh-hang-4k2x"
     */
    public String generateSlug(String firstName, String lastName) {
        String base = buildBaseSlug(firstName, lastName);
        if (base.length() < 3) {
            // Tên quá ngắn → dùng random slug
            base = "user-" + shortRandom();
        }

        // Thử slug thuần trước
        if (!profileRepository.existsByProfileUrl(BASE_URL + base)) {
            return BASE_URL + base;
        }

        // Thêm suffix ngẫu nhiên nếu trùng
        for (int i = 0; i < 5; i++) {
            String candidate = BASE_URL + base + "-" + shortRandom();
            if (!profileRepository.existsByProfileUrl(candidate)) {
                return candidate;
            }
        }

        // Fallback: dùng UUID suffix (cực kỳ hiếm trùng)
        return BASE_URL + base + "-" + UUID.randomUUID().toString().substring(0, 8);
    }

    // ── Validate & update ─────────

    /**
     * Validate slug do user chọn và trả về profileUrl đầy đủ.
     * Throw nếu slug không hợp lệ hoặc đã bị dùng bởi profile khác.
     */
    public String validateAndBuildUrl(String slug, UUID currentProfileId) {
        String normalized = normalizeSlug(slug);

        if (!SLUG_PATTERN.matcher(normalized).matches()) {
            throw new IllegalArgumentException(
                    "Slug không hợp lệ. Chỉ dùng chữ thường, số và dấu gạch ngang (3-30 ký tự).");
        }

        String url = BASE_URL + normalized;

        // Kiểm tra trùng — bỏ qua profile hiện tại
        profileRepository.findByProfileUrl(url).ifPresent(existing -> {
            if (!existing.getId().equals(currentProfileId)) {
                throw new IllegalArgumentException("Slug '" + normalized + "' đã được sử dụng.");
            }
        });

        return url;
    }

    // ── Private helpers ───────────

    private String buildBaseSlug(String firstName, String lastName) {
        String combined = ((firstName == null ? "" : firstName)
                + " "
                + (lastName == null ? "" : lastName)).trim();
        return normalizeSlug(combined);
    }

    /**
     * "Minh Hằng" → "minh-hang"
     * Bước 1: Unicode normalize (NFD) để tách dấu khỏi chữ cái
     * Bước 2: Bỏ dấu (ký tự combining marks)
     * Bước 3: Lowercase, thay space + ký tự lạ bằng dấu gạch ngang
     * Bước 4: Trim dash đầu/cuối, collapse consecutive dashes
     */
    private static String normalizeSlug(String input) {
        if (input == null || input.isBlank())
            return "";

        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD);
        // Xóa combining diacritical marks (dấu tiếng Việt, etc.)
        normalized = normalized.replaceAll("\\p{InCombiningDiacriticalMarks}", "");
        normalized = normalized.toLowerCase();
        normalized = normalized.replace(' ', '-');
        normalized = NON_SLUG_CHARS.matcher(normalized).replaceAll("");
        normalized = CONSECUTIVE_DASH.matcher(normalized).replaceAll("-");
        normalized = normalized.replaceAll("^-+|-+$", ""); // trim dashes

        // Giới hạn độ dài
        if (normalized.length() > 30)
            normalized = normalized.substring(0, 30);

        return normalized;
    }

    private static String shortRandom() {
        return Long.toString(Math.abs(UUID.randomUUID().getMostSignificantBits()), 36).substring(0, 4);
    }
}