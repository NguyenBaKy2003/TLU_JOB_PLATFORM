package edu.tlu.jobplatform.company.domain.repository;

import edu.tlu.jobplatform.company.domain.model.CompanyReview;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;
import java.util.UUID;

public interface CompanyReviewRepository {

    Optional<CompanyReview> findById(UUID id);

    /** Kiểm tra user đã review công ty này chưa */
    boolean existsByCompanyIdAndReviewerId(UUID companyId, UUID reviewerId);

    /** Danh sách review của 1 công ty (chỉ lấy visible) */
    Page<CompanyReview> findVisibleByCompanyId(UUID companyId, Pageable pageable);

    /** Điểm trung bình rating của công ty */
    Double getAverageRatingByCompanyId(UUID companyId);

    CompanyReview save(CompanyReview review);

    void deleteById(UUID id);
}