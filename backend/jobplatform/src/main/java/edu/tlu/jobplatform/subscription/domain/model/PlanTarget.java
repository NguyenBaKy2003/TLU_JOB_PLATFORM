package edu.tlu.jobplatform.subscription.domain.model;

/**
 * Phân biệt gói dịch vụ dành cho ai.
 *
 * COMPANY — dành cho nhà tuyển dụng (đã có sẵn)
 * CANDIDATE — dành cho ứng viên (mới thêm)
 *
 * Lý do tách enum thay vì dùng hai bảng riêng:
 * SubscriptionPlan là value object dùng chung, chỉ khác target.
 * Giữ một bảng duy nhất, dễ admin quản lý, dễ query.
 */
public enum PlanTarget {
    COMPANY,
    CANDIDATE
}