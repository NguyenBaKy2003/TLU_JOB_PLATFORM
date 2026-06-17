package edu.tlu.jobplatform.candidate.domain.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import edu.tlu.jobplatform.candidate.domain.repository.CandidateProfileRepository;

import java.text.Normalizer;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class ProfileUrlService {

    private static final Pattern SLUG_PATTERN = Pattern.compile("^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$");
    private static final Pattern NON_SLUG_CHARS = Pattern.compile("[^a-z0-9-]");
    private static final Pattern CONSECUTIVE_DASH = Pattern.compile("-{2,}");
    private static final String BASE_URL = "CareerUp.com/u/";

    private final CandidateProfileRepository profileRepository;

    public String generateSlug(String firstName, String lastName) {
        String base = buildBaseSlug(firstName, lastName);
        if (base.length() < 3) {
            base = "user-" + shortRandom();
        }

        if (!profileRepository.existsByProfileUrl(BASE_URL + base)) {
            return BASE_URL + base;
        }

        for (int i = 0; i < 5; i++) {
            String candidate = BASE_URL + base + "-" + shortRandom();
            if (!profileRepository.existsByProfileUrl(candidate)) {
                return candidate;
            }
        }

        return BASE_URL + base + "-" + UUID.randomUUID().toString().substring(0, 8);
    }

    public String validateAndBuildUrl(String slug, UUID currentProfileId) {
        String normalized = normalizeSlug(slug);

        if (!SLUG_PATTERN.matcher(normalized).matches()) {
            throw new IllegalArgumentException(
                    "Slug không hợp lệ. Chỉ dùng chữ thường, số và dấu gạch ngang (3-30 ký tự).");
        }

        String url = BASE_URL + normalized;

        profileRepository.findByProfileUrl(url).ifPresent(existing -> {
            if (!existing.getId().equals(currentProfileId)) {
                throw new IllegalArgumentException("Slug '" + normalized + "' đã được sử dụng.");
            }
        });

        return url;
    }

    private String buildBaseSlug(String firstName, String lastName) {
        String combined = ((firstName == null ? "" : firstName)
                + " "
                + (lastName == null ? "" : lastName)).trim();
        return normalizeSlug(combined);
    }

    private static String normalizeSlug(String input) {
        if (input == null || input.isBlank())
            return "";

        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD);
        normalized = normalized.replaceAll("\\p{InCombiningDiacriticalMarks}", "");
        normalized = normalized.toLowerCase();
        normalized = normalized.replace(' ', '-');
        normalized = NON_SLUG_CHARS.matcher(normalized).replaceAll("");
        normalized = CONSECUTIVE_DASH.matcher(normalized).replaceAll("-");
        normalized = normalized.replaceAll("^-+|-+$", ""); // trim dashes

        if (normalized.length() > 30)
            normalized = normalized.substring(0, 30);

        return normalized;
    }

    private static String shortRandom() {
        return Long.toString(Math.abs(UUID.randomUUID().getMostSignificantBits()), 36).substring(0, 4);
    }
}