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
 * - Admin có thể ẩn review vi phạm
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
    private boolean visible; // Admin có thể ẩn
    private boolean employed; // Đang/từng làm việc ở đây

    private final LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // ── Business Rules ────────────────────────────────────────

    public void hide() {
        this.visible = false;
    }

    public void show() {
        this.visible = true;
    }

    public void update(int rating, String title, String content,
            String pros, String cons) {
        validateRating(rating);
        this.rating = rating;
        this.title = title;
        this.content = content;
        this.pros = pros;
        this.cons = cons;
        this.updatedAt = LocalDateTime.now();
    }

    private void validateRating(int rating) {
        if (rating < 1 || rating > 5)
            throw new IllegalArgumentException("Rating phải từ 1 đến 5");
    }
}