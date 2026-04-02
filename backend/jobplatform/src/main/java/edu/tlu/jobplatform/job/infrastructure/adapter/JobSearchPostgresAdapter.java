package edu.tlu.jobplatform.job.infrastructure.adapter;

import edu.tlu.jobplatform.job.application.port.out.JobSearchPort;
import edu.tlu.jobplatform.job.domain.model.JobPost;
import edu.tlu.jobplatform.job.domain.model.vo.JobStatus;
import edu.tlu.jobplatform.job.domain.model.vo.WorkLocation;
import edu.tlu.jobplatform.job.infrastructure.persistence.entity.JobPostJpaEntity;
import edu.tlu.jobplatform.job.infrastructure.persistence.mapper.JobMapper;
import edu.tlu.jobplatform.job.infrastructure.persistence.repository.JobPostJpaRepo;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * PostgreSQL full-text search adapter.
 *
 * Dùng JPA Specification để build dynamic query.
 * Có thể swap sang Elasticsearch bằng cách tạo
 * ElasticsearchJobSearchAdapter implements JobSearchPort.
 */
@Component
@RequiredArgsConstructor
public class JobSearchPostgresAdapter implements JobSearchPort {

    private final JobPostJpaRepo jpaRepo;
    private final JobMapper mapper;

    @Override
    public SearchResult search(SearchCriteria c) {
        Specification<JobPostJpaEntity> spec = buildSpec(c);
        Pageable pageable = PageRequest.of(c.page(), c.size(), buildSort(c.sortBy()));

        Page<JobPostJpaEntity> page = jpaRepo.findAll(spec, pageable);
        List<JobPost> items = page.getContent().stream().map(mapper::toDomain).toList();

        return new SearchResult(items, page.getTotalElements(),
                page.getTotalPages(), page.getNumber());
    }

    // ── Specification builder ─────────────────────────────────

    private Specification<JobPostJpaEntity> buildSpec(SearchCriteria c) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Chỉ tìm PUBLISHED
            predicates.add(cb.equal(root.get("status"), JobStatus.PUBLISHED));

            // Keyword — tìm trong title và description
            if (c.keyword() != null && !c.keyword().isBlank()) {
                String pattern = "%" + c.keyword().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("title")), pattern),
                        cb.like(cb.lower(root.get("description")), pattern)));
            }

            if (c.categoryCode() != null && !c.categoryCode().isBlank())
                predicates.add(cb.equal(root.get("categoryCode"), c.categoryCode()));

            if (c.level() != null && !c.level().isBlank())
                predicates.add(cb.equal(root.get("level"), c.level()));

            if (c.jobType() != null && !c.jobType().isBlank())
                predicates.add(cb.equal(root.get("jobType"), c.jobType()));

            if (c.city() != null && !c.city().isBlank())
                predicates.add(cb.like(
                        cb.lower(root.get("workLocationCity")),
                        "%" + c.city().toLowerCase() + "%"));

            if (c.workLocationType() != null && !c.workLocationType().isBlank())
                predicates.add(cb.equal(
                        root.get("workLocationType"),
                        WorkLocation.Type.valueOf(c.workLocationType())));

            if (c.salaryMin() != null)
                predicates.add(cb.or(
                        cb.isTrue(root.get("salaryNegotiate")),
                        cb.greaterThanOrEqualTo(root.get("salaryMax"),
                                BigDecimal.valueOf(c.salaryMin()))));

            if (c.salaryMax() != null)
                predicates.add(cb.or(
                        cb.isTrue(root.get("salaryNegotiate")),
                        cb.lessThanOrEqualTo(root.get("salaryMin"),
                                BigDecimal.valueOf(c.salaryMax()))));

            if (c.featuredOnly())
                predicates.add(cb.isTrue(root.get("featured")));

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    private Sort buildSort(String sortBy) {
        return switch (sortBy != null ? sortBy : "newest") {
            case "salary" -> Sort.by(Sort.Direction.DESC, "salaryMax");
            case "relevance" -> Sort.by(Sort.Direction.DESC, "viewCount");
            default -> Sort.by(Sort.Direction.DESC, "publishedAt");
        };
    }
}