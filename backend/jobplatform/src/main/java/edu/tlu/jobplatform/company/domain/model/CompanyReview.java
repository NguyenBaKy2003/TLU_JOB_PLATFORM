package edu.tlu.jobplatform.company.domain.model;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Đánh giá công ty từ ứng viên/nhân viên.
 *
 * Business Rules:
 * - Rating từ 1 đến 5
 * - 1 user chỉ được review 1 công ty 1 lần
 * - Có thể ẩn danh (anonymous = true)
 * - Review cần được duyệt trước khi hiển thị
 * - Admin có thể ẩn/hủy review vi phạm
 */
@Getter
@Builder
public class CompanyReview {

    private final UUID id;
    private final UUID companyId;
    private final UUID reviewerId; // User viết review

    private int rating; // 1-5
    private String title;
    private String content;
    private String pros; // Điểm tốt
    private String cons; // Điểm chưa tốt

    private boolean anonymous; // Ẩn danh

    @Builder.Default
    private ReviewStatus status = ReviewStatus.PENDING; // Trạng thái phê duyệt

    private String rejectionReason; // Lý do từ chối (nếu bị reject)
    private UUID reviewedBy; // Admin/Company user đã duyệt
    private LocalDateTime reviewedAt; // Thời điểm duyệt

    private boolean visible; // Admin có thể ẩn sau khi đã approved
    private boolean employed; // Đang/từng làm việc ở đây

    private final LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // ── Business Rules ─

    /**
     * Admin hoặc Company duyệt review
     */
    public void approve(UUID reviewerId) {
        if (this.status != ReviewStatus.PENDING) {
            throw new IllegalStateException("Chỉ có thể duyệt review ở trạng thái PENDING");
        }
        this.status = ReviewStatus.APPROVED;
        this.visible = true;
        this.reviewedBy = reviewerId;
        this.reviewedAt = LocalDateTime.now();
    }

    /**
     * Admin hoặc Company từ chối review
     */
    public void reject(UUID reviewerId, String reason) {
        if (this.status != ReviewStatus.PENDING) {
            throw new IllegalStateException("Chỉ có thể từ chối review ở trạng thái PENDING");
        }
        if (reason == null || reason.trim().isEmpty()) {
            throw new IllegalArgumentException("Phải có lý do từ chối");
        }
        this.status = ReviewStatus.REJECTED;
        this.rejectionReason = reason;
        this.reviewedBy = reviewerId;
        this.reviewedAt = LocalDateTime.now();
    }

    /**
     * Admin ẩn review đã được duyệt (vi phạm chính sách)
     */
    public void hide() {
        if (this.status != ReviewStatus.APPROVED) {
            throw new IllegalStateException("Chỉ có thể ẩn review đã được duyệt");
        }
        this.visible = false;
    }

    /**
     * Admin hiển thị lại review đã ẩn
     */
    public void show() {
        if (this.status != ReviewStatus.APPROVED) {
            throw new IllegalStateException("Chỉ có thể hiển thị lại review đã được duyệt");
        }
        this.visible = true;
    }

    /**
     * User cập nhật review của mình (tự động chuyển về PENDING để duyệt lại)
     */
    public void update(int rating, String title, String content,
            String pros, String cons) {
        validateRating(rating);
        this.rating = rating;
        this.title = title;
        this.content = content;
        this.pros = pros;
        this.cons = cons;
        this.updatedAt = LocalDateTime.now();

        // Reset về PENDING để duyệt lại
        this.status = ReviewStatus.PENDING;
        this.rejectionReason = null;
        this.reviewedBy = null;
        this.reviewedAt = null;
        this.visible = false;
    }

    private void validateRating(int rating) {
        if (rating < 1 || rating > 5)
            throw new IllegalArgumentException("Rating phải từ 1 đến 5");
    }

    // ── Helper Methods ─

    public boolean isPending() {
        return this.status == ReviewStatus.PENDING;
    }

    public boolean isApproved() {
        return this.status == ReviewStatus.APPROVED;
    }

    public boolean isRejected() {
        return this.status == ReviewStatus.REJECTED;
    }

    public boolean isVisibleToPublic() {
        return this.status == ReviewStatus.APPROVED && this.visible;
    }
}