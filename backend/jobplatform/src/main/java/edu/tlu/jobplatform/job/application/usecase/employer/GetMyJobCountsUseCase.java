package edu.tlu.jobplatform.job.application.usecase.employer;

import edu.tlu.jobplatform.job.domain.model.vo.JobStatus;
import edu.tlu.jobplatform.job.domain.repository.JobPostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Trả về số lượng bài đăng theo từng trạng thái cho employer đang đăng nhập.
 *
 * Response shape (flat map, khớp với FE StatusCounts type):
 * {
 * "total": 42,
 * "PUBLISHED": 20,
 * "PENDING_REVIEW": 3,
 * "REJECTED": 2,
 * "DRAFT": 10,
 * "CLOSED": 5,
 * "EXPIRED": 2
 * }
 *
 * Tất cả status luôn có mặt trong response (0 nếu không có bài đăng nào).
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class GetMyJobCountsUseCase {

    private final JobPostRepository jobPostRepository;

    /**
     * @param postedBy UUID của employer (postedBy, không phải companyId)
     * @return Map có key "total" và các key tên status (String), value là Long
     */
    public Map<String, Long> execute(UUID postedBy) {
        Map<JobStatus, Long> rawCounts = jobPostRepository.countMyJobsByStatus(postedBy);

        // Bắt đầu với tất cả status = 0 để FE không cần guard undefined
        Map<String, Long> result = new LinkedHashMap<>();
        Arrays.stream(JobStatus.values())
                .forEach(s -> result.put(s.name(), rawCounts.getOrDefault(s, 0L)));

        long total = result.values().stream().mapToLong(Long::longValue).sum();
        result.put("total", total);

        return result;
    }
}