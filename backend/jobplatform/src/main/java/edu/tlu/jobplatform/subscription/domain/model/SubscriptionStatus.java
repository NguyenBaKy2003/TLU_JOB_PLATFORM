package edu.tlu.jobplatform.subscription.domain.model;

public enum SubscriptionStatus {
    PENDING, // Chờ thanh toán
    ACTIVE, // Đang hoạt động
    EXPIRED, // Hết hạn
    CANCELLED, // Đã huỷ
    FAILED // Thanh toán thất bại
}