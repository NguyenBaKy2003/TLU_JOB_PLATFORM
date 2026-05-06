package edu.tlu.jobplatform.cv.domain.service;

import edu.tlu.jobplatform.candidate.domain.model.CandidateCV;
import edu.tlu.jobplatform.cv.domain.model.OnlineCV;
import edu.tlu.jobplatform.cv.domain.repository.OnlineCVRepository;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.util.List;
import java.util.UUID;
import java.util.regex.Pattern;

/**
 * Domain Service — toàn bộ business rules liên quan đến CV.
 *
 * BR-01: Mỗi candidate tối đa 10 CV
 * BR-02: Phải có ít nhất 1 CV mới được set primary
 * BR-03: Khi xóa CV primary → tự động chọn CV mới nhất làm primary
 */
@Service
@RequiredArgsConstructor
public class CVDomainService {

    private static final int MAX_CVS_PER_CANDIDATE = 10;

    private final OnlineCVRepository cvRepository;

    // ── BR-01: Giới hạn số lượng CV

    /**
     * Validate qua repository — dùng khi tạo OnlineCV.
     */
    public void validateCanCreateCV(UUID candidateId) {
        long count = cvRepository.countByCandidateId(candidateId);
        if (count >= MAX_CVS_PER_CANDIDATE) {
            throw new BusinessRuleException(
                    "Bạn đã đạt giới hạn tối đa %d CV. Vui lòng xóa bớt CV cũ trước khi tạo mới."
                            .formatted(MAX_CVS_PER_CANDIDATE),
                    "CV_LIMIT_EXCEEDED");
        }
    }

    /**
     * Validate qua count thuần — dùng khi upload CandidateCV (không cần repo).
     */
    public void validateCanAddCV(int currentCount) {
        if (currentCount >= MAX_CVS_PER_CANDIDATE) {
            throw new BusinessRuleException(
                    "Bạn chỉ có thể lưu tối đa " + MAX_CVS_PER_CANDIDATE + " CV.",
                    "CV_LIMIT_EXCEEDED");
        }
    }

    // ── Ownership ─

    public OnlineCV loadAndVerifyOwnership(UUID cvId, UUID candidateId) {
        OnlineCV cv = cvRepository.findById(cvId)
                .orElseThrow(() -> new BusinessRuleException(
                        "CV không tồn tại.", "CV_NOT_FOUND"));
        if (!cv.isOwnedBy(candidateId)) {
            throw new BusinessRuleException(
                    "Bạn không có quyền truy cập CV này.", "CV_ACCESS_DENIED");
        }
        return cv;
    }

    // ── BR-02 & BR-03: Primary CV ──

    /**
     * BR-02: Đổi primary CV — unmark tất cả, mark cái được chọn.
     */
    public void switchPrimary(List<CandidateCV> allCVs, CandidateCV target) {
        if (allCVs.stream().noneMatch(cv -> cv.getId().equals(target.getId()))) {
            throw new BusinessRuleException(
                    "CV không thuộc về candidate này.", "CV_NOT_OWNED");
        }
        allCVs.forEach(CandidateCV::unmarkPrimary);
        target.markAsPrimary();
    }

    /**
     * BR-03: Sau khi xóa CV primary → tự động chọn CV mới nhất làm primary.
     */
    public List<CandidateCV> handlePrimaryDeleted(List<CandidateCV> remaining) {
        if (remaining.isEmpty())
            return remaining;

        remaining.stream()
                .max((a, b) -> a.getCreatedAt().compareTo(b.getCreatedAt()))
                .ifPresent(CandidateCV::markAsPrimary);

        return remaining;
    }

    // ── Slug generation

    public String generateUniqueSlug(String title, UUID candidateId) {
        String base = toSlug(title + "-" + candidateId.toString().substring(0, 6));
        if (!cvRepository.existsBySlug(base)) {
            return base;
        }
        String slug = base + "-" + UUID.randomUUID().toString().substring(0, 4);
        int attempts = 0;
        while (cvRepository.existsBySlug(slug) && attempts < 5) {
            slug = base + "-" + UUID.randomUUID().toString().substring(0, 4);
            attempts++;
        }
        return slug;
    }

    // ── Helpers

    private static final Pattern NON_LATIN = Pattern.compile("[^\\w-]");
    private static final Pattern WHITESPACE = Pattern.compile("[\\s]+");

    private String toSlug(String input) {
        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD);
        String withoutAccents = normalized.replaceAll("\\p{InCombiningDiacriticalMarks}+", "");
        String slug = withoutAccents.toLowerCase()
                .replace("đ", "d")
                .replace("Đ", "d");
        slug = WHITESPACE.matcher(slug).replaceAll("-");
        slug = NON_LATIN.matcher(slug).replaceAll("");
        slug = slug.replaceAll("-{2,}", "-").replaceAll("^-|-$", "");
        return slug.isEmpty() ? "cv-" + UUID.randomUUID().toString().substring(0, 8) : slug;
    }
}