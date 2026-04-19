package edu.tlu.jobplatform.payment.domain.model;

public enum PaymentStatus {
    PENDING, // Đang chờ thanh toán
    SUCCESS, // Thành công
    FAILED, // Thất bại
    REFUNDED // Đã hoàn tiền
}