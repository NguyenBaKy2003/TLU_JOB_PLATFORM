package edu.tlu.jobplatform.company.domain.model;

/**
 * Trạng thái phê duyệt của Company Review
 */
public enum ReviewStatus {
    /**
     * Chờ duyệt - Review mới tạo hoặc vừa được cập nhật
     */
    PENDING,

    /**
     * Đã duyệt - Review được phép hiển thị (nếu visible = true)
     */
    APPROVED,

    /**
     * Từ chối - Review không được duyệt, cần có lý do
     */
    REJECTED
}