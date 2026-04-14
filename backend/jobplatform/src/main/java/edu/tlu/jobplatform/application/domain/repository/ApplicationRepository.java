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
    Page<Application> findByJobPostIdAndStatus(UUID jobPostId,
            ApplicationStatus status,
            Pageable pageable);

    /** Tất cả đơn của 1 công ty */
    Page<Application> findByCompanyId(UUID companyId, Pageable pageable);

    /** Đơn của ứng viên vào 1 bài đăng cụ thể */
    Optional<Application> findByJobPostIdAndCandidateId(UUID jobPostId, UUID candidateId);

    Application save(Application application);
}