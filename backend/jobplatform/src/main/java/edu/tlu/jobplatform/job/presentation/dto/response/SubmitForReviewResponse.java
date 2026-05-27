package edu.tlu.jobplatform.job.presentation.dto.response;

import edu.tlu.jobplatform.ai.domain.model.JdGuidelineCheckResult;
import edu.tlu.jobplatform.ai.domain.model.JdGuidelineCheckResult.Violation;
import edu.tlu.jobplatform.job.domain.model.JobPost;
import edu.tlu.jobplatform.job.domain.model.vo.JobStatus;

import java.util.List;

public record SubmitForReviewResponse(
        JobPostDetailResponse job,
        ReviewResult review) {

    public static SubmitForReviewResponse from(JobPost job, JdGuidelineCheckResult check) {
        return new SubmitForReviewResponse(
                JobPostDetailResponse.from(job),
                ReviewResult.from(check, job.getStatus(), job.getRejectionReason()));
    }

    public record ReviewResult(
            String decision, // "APPROVED" | "REJECTED"
            String severity,
            int qualityScore,
            String overallFeedback,
            String rejectionReason, // chuỗi tổng hợp lưu trong JobPost
            List<ViolationDetail> violations) {
        public static ReviewResult from(JdGuidelineCheckResult check,
                JobStatus jobStatus,
                String rejectionReason) {
            List<ViolationDetail> details = check.getViolations() == null ? List.of()
                    : check.getViolations().stream()
                            .map(ViolationDetail::from)
                            .toList();

            return new ReviewResult(
                    jobStatus == JobStatus.PUBLISHED ? "APPROVED" : "REJECTED",
                    check.getSeverity() != null ? check.getSeverity().name() : null,
                    check.getQualityScore(),
                    check.getOverallFeedback(),
                    rejectionReason,
                    details);
        }
    }

    public record ViolationDetail(
            String type,
            String excerpt,
            String explanation,
            String suggestion) {
        public static ViolationDetail from(Violation v) {
            return new ViolationDetail(
                    v.getType() != null ? v.getType().name() : null,
                    v.getExcerpt(),
                    v.getExplanation(),
                    v.getSuggestion());
        }
    }
}