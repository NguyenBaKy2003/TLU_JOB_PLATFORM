package edu.tlu.jobplatform.application.domain.repository;

import edu.tlu.jobplatform.application.domain.model.Application;
import edu.tlu.jobplatform.application.domain.model.vo.ApplicationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;
import java.util.UUID;

public interface ApplicationRepository {

    Optional<Application> findById(UUID id);

    boolean existsById(UUID id);

    /** Kiểm tra ứng viên đã nộp vào bài đăng này chưa */
    boolean existsByJobPostIdAndCandidateId(UUID jobPostId, UUID candidateId);

    /** Danh sách đơn của ứng viên */
    Page<Application> findByCandidateId(UUID candidateId, Pageable pageable);

    /** Danh sách đơn của 1 bài đăng — employer xem */
    Page<Application> findByJobPostId(UUID jobPostId, Pageable pageable);

    /** Lọc theo status */
    Page<Application> findByJobPostIdAndStatus(UUID jobPostId, ApplicationStatus status, Pageable pageable);

    /** Đơn của ứng viên vào 1 bài đăng cụ thể */
    Optional<Application> findByJobPostIdAndCandidateId(UUID jobPostId, UUID candidateId);

    Application save(Application application);

    /** Tất cả đơn của 1 công ty (không lọc status) */
    Page<Application> findByCompanyId(UUID companyId, Pageable pageable);

    /** Tất cả đơn của 1 công ty, có lọc status */
    Page<Application> findByCompanyId(UUID companyId, ApplicationStatus status, Pageable pageable);

    /** Đếm tổng tất cả đơn — dùng cho admin dashboard */
    long countAll();

    // ── Search methods (admin) ─

    /**
     * Admin: tìm tất cả đơn, lọc theo status và keyword.
     * Keyword null/blank → bỏ qua điều kiện search.
     */
    Page<Application> searchAll(ApplicationStatus status, String keyword, Pageable pageable);

    /**
     * Admin: tìm đơn theo công ty, lọc theo status và keyword.
     */
    Page<Application> searchByCompanyId(UUID companyId, ApplicationStatus status, String keyword, Pageable pageable);

    /**
     * Admin/Employer: tìm đơn theo bài đăng, lọc theo status và keyword.
     */
    Page<Application> searchByJobPostId(UUID jobPostId, ApplicationStatus status, String keyword, Pageable pageable);

    int countByJobPostId(UUID jobPostId);

    Optional<Double> averageAIScoreByJobPostId(UUID jobPostId);

    int countByCandidateId(UUID candidateId);

    int countInterviewedByCandidateId(UUID candidateId);

    Page<Application> findByJobPostIdOrderByBoostFirst(UUID jobPostId, Pageable pageable);

    Page<Application> findByJobPostIdAndStatusOrderByBoostFirst(UUID jobPostId, ApplicationStatus status,
            Pageable pageable);

    Page<Application> findByCompanyIdOrderByBoostFirst(UUID companyId, Pageable pageable);

    Page<Application> findByCompanyIdAndStatusOrderByBoostFirst(UUID companyId, ApplicationStatus status,
            Pageable pageable);
}