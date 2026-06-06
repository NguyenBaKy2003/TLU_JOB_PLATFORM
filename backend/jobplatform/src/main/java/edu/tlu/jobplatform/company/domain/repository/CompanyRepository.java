package edu.tlu.jobplatform.company.domain.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import edu.tlu.jobplatform.company.domain.model.CompanyProfile;
import edu.tlu.jobplatform.company.domain.model.VerificationStatus;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

public interface CompanyRepository {

    Optional<CompanyProfile> findById(UUID id);

    Optional<CompanyProfile> findByOwnerId(UUID ownerId);

    List<CompanyProfile> findAllById(Collection<UUID> ids);

    Optional<CompanyProfile> findBySlug(String slug);

    boolean existsByOwnerId(UUID ownerId);

    boolean existsBySlug(String slug);

    boolean existsByName(String name);

    long countAll();

    long countByVerificationStatus(VerificationStatus status);

    Page<CompanyProfile> findByVerificationStatus(VerificationStatus status, Pageable pageable);

    Page<CompanyProfile> findVerifiedCompanies(Pageable pageable);

    CompanyProfile save(CompanyProfile company);

    List<CompanyProfile> findAllByOwnerIdIn(Collection<UUID> ownerIds);

    Page<CompanyProfile> findAll(Pageable pageable);

    void deleteById(UUID id);

    Page<CompanyProfile> findVerifiedCompaniesWithOpenJobs(Pageable pageable);

    List<CompanyProfile> findByNamesIgnoreCase(List<String> names);

    Map<UUID, Long> countOpenJobsByCompanyIds(Set<UUID> companyIds);

    void enrichWithStats(CompanyProfile company);

    void enrichWithStats(List<CompanyProfile> companies);

    Page<CompanyProfile> findVerifiedCompaniesSortedByPlan(Pageable pageable);

    Map<UUID, String> findActivePlanCodesByCompanyIds(Set<UUID> companyIds);

    /**
     * Tìm kiếm đa điều kiện — tất cả filter đều optional (null = bỏ qua).
     * Sort: plan tier → rating DESC → created_at ASC.
     *
     * @param keyword   tìm theo tên / mô tả / ngành
     * @param city      lọc thành phố
     * @param size      lọc quy mô
     *                  (STARTUP/SMALL/MEDIUM/LARGE/ENTERPRISE/CORPORATION)
     * @param planCode  lọc plan (STARTER/BUSINESS/ENTERPRISE/FREE_COMPANY)
     * @param minRating điểm đánh giá tối thiểu (1.0 – 5.0)
     * @param pageable  phân trang
     */
    Page<CompanyProfile> search(
            String keyword,
            String city,
            String size,
            String planCode,
            Double minRating,
            Pageable pageable);

    Page<CompanyProfile> adminSearch(
            String status,
            String keyword,
            String city,
            String size,
            String planCode,
            Double minRating,
            Pageable pageable);

}