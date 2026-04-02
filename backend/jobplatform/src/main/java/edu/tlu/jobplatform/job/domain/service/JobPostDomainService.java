package edu.tlu.jobplatform.job.domain.service;

import edu.tlu.jobplatform.job.domain.model.JobPost;
import edu.tlu.jobplatform.job.domain.model.vo.JobStatus;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

/**
 * Domain Service: Business logic phức tạp liên quan vòng đời JobPost.
 *
 * Tại sao không đặt trong JobPost?
 * - publish() cần validate nhiều điều kiện business (deadline, description...)
 * - Logic này cần tái sử dụng ở nhiều UseCase (PublishJob, ReopenJob...)
 */
@Service
public class JobPostDomainService {

    /**
     * Validate và publish một JobPost.
     * Kiểm tra đủ điều kiện trước khi gọi job.publish().
     *
     * @param job JobPost cần publish
     */
    public void publish(JobPost job) {
        validateForPublish(job);
        job.publish();
    }

    /**
     * Đóng tin tuyển dụng — employer chủ động đóng.
     */
    public void close(JobPost job) {
        job.close();
    }

    /**
     * Hết hạn tin — gọi bởi scheduler.
     * Chỉ expire những tin PUBLISHED và đã qua deadline.
     */
    public void expire(JobPost job) {
        if (job.getStatus() != JobStatus.PUBLISHED)
            return; // Bỏ qua nếu không phải PUBLISHED

        if (job.getDeadline() == null || LocalDateTime.now().isBefore(job.getDeadline()))
            return; // Chưa hết hạn

        job.expire();
    }

    /**
     * Tạo JobPost mới ở trạng thái DRAFT.
     * Validate các field bắt buộc.
     */
    public void validateForCreate(String title, String description, LocalDateTime deadline) {
        if (title == null || title.isBlank())
            throw new BusinessRuleException("Tiêu đề tin tuyển dụng không được để trống.", "TITLE_REQUIRED");

        if (description == null || description.isBlank())
            throw new BusinessRuleException("Mô tả công việc không được để trống.", "DESCRIPTION_REQUIRED");

        if (deadline != null && deadline.isBefore(LocalDateTime.now().plusDays(1)))
            throw new BusinessRuleException("Hạn nộp hồ sơ phải sau ít nhất 1 ngày.", "INVALID_DEADLINE");
    }

    // ── Private helpers ───────────────────────────────────────

    private void validateForPublish(JobPost job) {
        if (job.getTitle() == null || job.getTitle().isBlank())
            throw new BusinessRuleException("Cần có tiêu đề trước khi publish.", "TITLE_REQUIRED");

        if (job.getDescription() == null || job.getDescription().isBlank())
            throw new BusinessRuleException("Cần có mô tả công việc trước khi publish.", "DESCRIPTION_REQUIRED");

        if (job.getDeadline() == null)
            throw new BusinessRuleException("Cần có hạn nộp hồ sơ trước khi publish.", "DEADLINE_REQUIRED");

        if (job.getDeadline().isBefore(LocalDateTime.now()))
            throw new BusinessRuleException("Hạn nộp hồ sơ đã qua, không thể publish.", "DEADLINE_PASSED");

        if (job.getWorkLocation() == null)
            throw new BusinessRuleException("Cần có địa điểm làm việc trước khi publish.", "WORK_LOCATION_REQUIRED");

        if (job.getSalary() == null)
            throw new BusinessRuleException("Cần có thông tin lương trước khi publish.", "SALARY_REQUIRED");
    }
}