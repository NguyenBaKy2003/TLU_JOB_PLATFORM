package edu.tlu.jobplatform.candidate.domain.service;

import edu.tlu.jobplatform.candidate.domain.model.CandidateCV;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;

import java.util.List;

import org.springframework.stereotype.Service;

/**
 * Business rules liên quan đến CV — không phụ thuộc infrastructure.
 *
 * BR-01: Mỗi candidate tối đa 5 CV
 * BR-02: Phải có ít nhất 1 CV mới được set primary
 * BR-03: Khi xóa CV primary → tự động chọn CV mới nhất làm primary
 */

@Service
public class CVDomainService {

    private static final int MAX_CV_COUNT = 5;

    /**
     * BR-01: Validate số lượng CV trước khi upload thêm.
     */
    public void validateCanAddCV(int currentCount) {
        if (currentCount >= MAX_CV_COUNT) {
            throw new BusinessRuleException(
                    "Bạn chỉ có thể lưu tối đa " + MAX_CV_COUNT + " CV.",
                    "CV_LIMIT_EXCEEDED");
        }
    }

    /**
     * BR-03: Sau khi xóa CV primary, chọn CV còn lại mới nhất làm primary.
     * Trả về list đã cập nhật để caller save.
     */
    public List<CandidateCV> handlePrimaryDeleted(List<CandidateCV> remaining) {
        if (remaining.isEmpty())
            return remaining;

        // Chọn CV có createdAt mới nhất
        remaining.stream()
                .max((a, b) -> a.getCreatedAt().compareTo(b.getCreatedAt()))
                .ifPresent(CandidateCV::markAsPrimary);

        return remaining;
    }

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
}