package edu.tlu.jobplatform.job.application.port.out;

import edu.tlu.jobplatform.job.domain.model.JobPost;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Output Port để tìm kiếm bài đăng.
 *
 * Sprint 1-4: PostgresJobSearchAdapter — dùng LIKE query đơn giản
 * Sprint 5: ElasticsearchJobSearchAdapter — full-text + vector search
 *
 * Đổi implementation không ảnh hưởng đến UseCase.
 */
@Component
public interface JobSearchPort {
    Page<JobPost> search(
            String keyword, String city, String category, UUID companyId,
            String workLocType,
            String currency,
            BigDecimal minSalary, BigDecimal maxSalary,
            LocalDateTime postedAfter,
            List<String> jobTypes, List<String> levels,
            Pageable pageable);
}