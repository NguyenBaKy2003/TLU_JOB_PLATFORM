package edu.tlu.jobplatform.job.domain.service;

import edu.tlu.jobplatform.job.domain.model.JobPost;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

/**
 * Domain Service chứa business rules phức tạp của JobPost
 * không thuộc về 1 entity đơn lẻ nào.
 */
@Service
public class JobPostDomainService {

    /**
     * Validate trước khi publish.
     * BR-01: Phải có tiêu đề
     * BR-02: Phải có mô tả (ít nhất 100 ký tự)
     * BR-03: Phải có deadline và deadline phải trong tương lai
     * BR-04: Phải có địa điểm làm việc
     */
    public void validateForPublish(JobPost job) {

        if (job.getTitle() == null || job.getTitle().isBlank())
            throw new BusinessRuleException("Tiêu đề bài đăng không được để trống.", "JOB_TITLE_REQUIRED");

        if (job.getDescription() == null || job.getDescription().length() < 100)
            throw new BusinessRuleException("Mô tả công việc phải có ít nhất 100 ký tự.", "JOB_DESCRIPTION_TOO_SHORT");

        if (job.getDeadline() == null)
            throw new BusinessRuleException("Vui lòng chọn hạn nộp CV.", "JOB_DEADLINE_REQUIRED");

        if (job.getDeadline().isBefore(LocalDate.now()))
            throw new BusinessRuleException("Hạn nộp CV phải là ngày trong tương lai.", "JOB_DEADLINE_PAST");

        if (job.getWorkLocation() == null)
            throw new BusinessRuleException("Vui lòng chọn địa điểm làm việc.", "JOB_LOCATION_REQUIRED");

        if (job.getSalary() == null)
            throw new BusinessRuleException("Vui lòng điền thông tin mức lương.", "JOB_SALARY_REQUIRED");
    }

    /**
     * Kiểm tra bài đăng có bị hết hạn không.
     * Dùng bởi SubscriptionExpiryScheduler.
     */
    public boolean isExpired(JobPost job) {
        if (job.getDeadline() == null)
            return false;
        return LocalDate.now().isAfter(job.getDeadline());
    }
}