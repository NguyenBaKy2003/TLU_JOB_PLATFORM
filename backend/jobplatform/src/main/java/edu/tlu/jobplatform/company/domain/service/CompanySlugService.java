package edu.tlu.jobplatform.company.domain.service;

import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.util.Locale;

@Service
public class CompanySlugService {

    public String generateSlug(String input) {
        if (input == null || input.isBlank()) {
            return "";
        }

        // bỏ dấu tiếng Việt
        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD);
        String slug = normalized.replaceAll("\\p{InCombiningDiacriticalMarks}+", "");

        // chuyển về lowercase
        slug = slug.toLowerCase(Locale.ROOT);

        // thay ký tự đặc biệt bằng dấu -
        slug = slug.replaceAll("[^a-z0-9]+", "-");

        // bỏ dấu - ở đầu/cuối
        slug = slug.replaceAll("^-+|-+$", "");

        return slug;
    }
}