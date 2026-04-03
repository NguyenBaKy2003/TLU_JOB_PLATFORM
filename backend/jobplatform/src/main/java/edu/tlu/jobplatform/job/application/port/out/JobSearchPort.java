package edu.tlu.jobplatform.job.application.port.out;

import edu.tlu.jobplatform.job.domain.model.JobPost;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

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

    /**
     * Tìm kiếm bài đăng với filter.
     * 
     * @param keyword   từ khoá tìm kiếm trong title/description
     * @param city      lọc theo thành phố
     * @param category  lọc theo ngành nghề
     * @param jobType   FULL_TIME, PART_TIME, CONTRACT, INTERN
     * @param level     JUNIOR, MIDDLE, SENIOR...
     * @param companyId lọc theo công ty cụ thể (nullable)
     */
    Page<JobPost> search(String keyword, String city, String category,
            String jobType, String level, UUID companyId,
            Pageable pageable);
}