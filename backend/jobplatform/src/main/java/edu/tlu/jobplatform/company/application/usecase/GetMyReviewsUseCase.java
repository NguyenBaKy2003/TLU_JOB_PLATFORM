package edu.tlu.jobplatform.company.application.usecase;

import edu.tlu.jobplatform.company.domain.model.CompanyProfile;
import edu.tlu.jobplatform.company.domain.model.ReviewStatus;
import edu.tlu.jobplatform.company.domain.repository.CompanyRepository;
import edu.tlu.jobplatform.company.domain.repository.CompanyReviewRepository;
import edu.tlu.jobplatform.company.presentation.dto.response.ReviewResponse;
import edu.tlu.jobplatform.shared.response.PageResponse;
import lombok.Builder;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class GetMyReviewsUseCase {

        private final CompanyReviewRepository reviewRepository;
        private final CompanyRepository companyRepository;

        @Getter
        @Builder
        public static class Query {
                private UUID reviewerId;
                private ReviewStatus status;
                private String keyword;
                private LocalDateTime createdAtFrom;
                private LocalDateTime createdAtTo;
                private int page;
                private int size;
        }

        public record Result(
                        PageResponse<ReviewResponse> reviews,
                        Map<ReviewStatus, Long> statusCounts,
                        long total) {
        }

        @Transactional(readOnly = true)
        public Result execute(Query query) {

                var pageable = PageRequest.of(
                                query.getPage(),
                                query.getSize(),
                                Sort.by("createdAt").descending());

                boolean noFilter = query.getStatus() == null
                                && isBlank(query.getKeyword())
                                && query.getCreatedAtFrom() == null
                                && query.getCreatedAtTo() == null;

                // 1. Fetch page
                Page<ReviewResponse> rawPage = noFilter
                                ? reviewRepository.findByReviewerId(query.getReviewerId(), pageable)
                                                .map(r -> ReviewResponse.from(r, r.isAnonymous() ? "Ẩn danh" : null))
                                : reviewRepository.searchByReviewerId(
                                                query.getReviewerId(),
                                                query.getStatus(),
                                                query.getKeyword(),
                                                query.getCreatedAtFrom(),
                                                query.getCreatedAtTo(),
                                                pageable)
                                                .map(r -> ReviewResponse.from(r, r.isAnonymous() ? "Ẩn danh" : null));

                // 2. Batch-fetch companies — 1 query
                Set<UUID> companyIds = rawPage.getContent().stream()
                                .map(ReviewResponse::getCompanyId)
                                .collect(Collectors.toSet());

                Map<UUID, ReviewResponse.CompanySnapshot> snapshotMap = companyRepository.findAllById(companyIds)
                                .stream()
                                .collect(Collectors.toMap(
                                                CompanyProfile::getId,
                                                c -> new ReviewResponse.CompanySnapshot(
                                                                c.getName(),
                                                                c.getSlug(),
                                                                c.getLogoUrl(),
                                                                c.getIndustry(),
                                                                c.getCity())));

                // 3. Enrich với company snapshot
                Page<ReviewResponse> enrichedPage = rawPage.map(response -> {
                        var snap = snapshotMap.get(response.getCompanyId());
                        if (snap != null) {
                                response.setCompanyName(snap.name());
                                response.setCompanySlug(snap.slug());
                                response.setCompanyLogoUrl(snap.logoUrl());
                                response.setCompanyIndustry(snap.industry());
                                response.setCompanyLocation(snap.location());
                        }
                        return response;
                });

                // 4. Count theo status — 1 query
                Map<ReviewStatus, Long> statusCounts = reviewRepository.countByStatusForReviewer(query.getReviewerId());

                long total = statusCounts.values().stream().mapToLong(Long::longValue).sum();

                log.info("GetMyReviews: reviewerId={}, status={}, keyword={}, total={}",
                                query.getReviewerId(), query.getStatus(), query.getKeyword(), total);

                return new Result(PageResponse.from(enrichedPage), statusCounts, total);
        }

        private static boolean isBlank(String s) {
                return s == null || s.isBlank();
        }
}