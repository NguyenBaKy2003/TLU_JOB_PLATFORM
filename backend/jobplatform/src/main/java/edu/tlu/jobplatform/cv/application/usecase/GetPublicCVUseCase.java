package edu.tlu.jobplatform.cv.application.usecase;

import edu.tlu.jobplatform.cv.domain.model.OnlineCV;
import edu.tlu.jobplatform.cv.domain.model.vo.CVStatus;
import edu.tlu.jobplatform.cv.domain.model.vo.CVVisibility;
import edu.tlu.jobplatform.cv.domain.repository.OnlineCVRepository;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import edu.tlu.jobplatform.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Lấy CV public qua slug — không yêu cầu authentication.
 *
 * Rules:
 * - CV phải PUBLISHED
 * - Visibility phải PUBLIC hoặc LINK_ONLY (PRIVATE → 404)
 * - viewCount tăng async sau mỗi lượt xem
 * - Chỉ trả về getVisibleSections() (hidden sections bị lọc)
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class GetPublicCVUseCase {

    private final OnlineCVRepository cvRepository;

    @Transactional(readOnly = true)
    public OnlineCV execute(String slug, String viewerIp) {
        OnlineCV cv = cvRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("CV không tồn tại.", "CV_NOT_FOUND"));

        if (cv.getStatus() != CVStatus.PUBLISHED) {
            throw new ResourceNotFoundException("CV không tồn tại.", "CV_NOT_FOUND");
        }

        if (cv.getVisibility() == CVVisibility.PRIVATE) {
            throw new BusinessRuleException("CV này không công khai.", "CV_NOT_PUBLIC");
        }

        // Tăng viewCount async — không block response
        incrementViewCountAsync(cv.getId(), viewerIp);

        return cv;
    }

    @Async
    public void incrementViewCountAsync(java.util.UUID cvId, String viewerIp) {
        try {
            cvRepository.findById(cvId).ifPresent(cv -> {
                cv.incrementViewCount();
                cvRepository.save(cv);
            });
        } catch (Exception e) {
            log.warn("Failed to increment view count: cvId={} error={}", cvId, e.getMessage());
        }
    }
}