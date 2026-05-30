package edu.tlu.jobplatform.job.domain.repository;

import edu.tlu.jobplatform.job.domain.model.SavedJob;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

public interface SavedJobRepository {

    Optional<SavedJob> findByCandidateIdAndJobPostId(UUID candidateId, UUID jobPostId);

    boolean existsByCandidateIdAndJobPostId(UUID candidateId, UUID jobPostId);

    /** Fast path — không filter */
    Page<SavedJob> findByCandidateId(UUID candidateId, Pageable pageable);

    /**
     * Tìm bài đã lưu theo đa điều kiện.
     * Tất cả tham số lọc đều nullable → bỏ qua nếu null/blank.
     */
    Page<SavedJob> searchByCandidateId(
            UUID candidateId,
            String keyword,
            String jobType,
            String category,
            LocalDateTime savedAtFrom,
            LocalDateTime savedAtTo,
            Pageable pageable);

    /**
     * Đếm số bài đã lưu nhóm theo category.
     * Key là tên category, value là số lượng.
     */
    Map<String, Long> countByCategoryForCandidate(UUID candidateId);

    SavedJob save(SavedJob savedJob);

    void deleteByCandidateIdAndJobPostId(UUID candidateId, UUID jobPostId);
}