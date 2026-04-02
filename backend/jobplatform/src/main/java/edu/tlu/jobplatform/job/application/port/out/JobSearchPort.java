package edu.tlu.jobplatform.job.application.port.out;

import edu.tlu.jobplatform.job.domain.model.JobPost;

import java.util.List;

/**
 * Output Port: Tìm kiếm tin tuyển dụng.
 *
 * Abstraction cho phép swap giữa:
 * - PostgreSQL full-text search (simple, đủ dùng ban đầu)
 * - Elasticsearch (khi cần scale)
 *
 * UseCase chỉ biết interface này — không biết implementation cụ thể.
 */
public interface JobSearchPort {

    /**
     * Tìm kiếm tin tuyển dụng theo các tiêu chí lọc.
     *
     * @param criteria Bộ lọc tìm kiếm
     * @return Kết quả phân trang
     */
    SearchResult search(SearchCriteria criteria);

    // ── DTOs ──────────────────────────────────────────────────

    record SearchCriteria(
            String keyword, // Tìm trong title, description
            String categoryCode,
            String level, // "INTERN", "JUNIOR", "SENIOR"...
            String jobType, // "FULL_TIME", "PART_TIME"...
            String city, // Lọc theo thành phố
            String workLocationType, // "REMOTE", "ONSITE", "HYBRID"
            Long salaryMin,
            Long salaryMax,
            List<String> skills, // Lọc theo kỹ năng
            boolean featuredOnly,
            int page,
            int size,
            String sortBy // "relevance", "newest", "salary"
    ) {
        public static SearchCriteria defaults() {
            return new SearchCriteria(null, null, null, null,
                    null, null, null, null, List.of(),
                    false, 0, 20, "newest");
        }
    }

    record SearchResult(
            List<JobPost> items,
            long totalElements,
            int totalPages,
            int currentPage) {
    }
}