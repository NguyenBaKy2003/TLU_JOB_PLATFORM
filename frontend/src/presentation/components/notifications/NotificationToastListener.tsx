"use client";
/**
 * NotificationToastListener
 *
 * Mount 1 lần trong layout (candidate layout).
 * Lắng nghe realtime notification qua WebSocketContext
 * và hiển thị toast tương ứng với từng loại.
 *
 * Cách dùng — thêm vào layout:
 *   <NotificationToastListener />
 */
import { useEffect } from "react";
import { useWebSocket } from "@/application/contexts/WebSocketContext";
import { useToast }      from "@/presentation/components/ui/toast";
import type { NotificationItem } from "@/domain/models/Notification";

// ── Map NotificationType → toast config ───────────────────────────────────────

interface ToastConfig {
  title:   (n: NotificationItem) => string;
  message: (n: NotificationItem) => string;
  type:    "success" | "info" | "warning" | "error";
}

const NOTIFICATION_TOAST_MAP: Partial<Record<string, ToastConfig>> = {

  // ── Candidate nhận ─────────────────────────────────────────────────────────

  JOB_INVITATION: {
    type:    "info",
    title:   () => "Lời mời ứng tuyển",
    message: (n) => n.body || "Bạn vừa nhận được lời mời ứng tuyển mới.",
  },

  APPLICATION_STATUS_CHANGED: {
    type:    "info",
    title:   () => "Trạng thái đơn thay đổi",
    message: (n) => n.body || "Trạng thái đơn ứng tuyển của bạn vừa được cập nhật.",
  },

  INTERVIEW_SCHEDULED: {
    type:    "success",
    title:   () => "Lịch phỏng vấn",
    message: (n) => n.body || "Bạn có lịch phỏng vấn mới.",
  },

  INTERVIEW_REMINDER: {
    type:    "warning",
    title:   () => "Nhắc nhở phỏng vấn",
    message: (n) => n.body || "Bạn có lịch phỏng vấn sắp tới.",
  },

  JOB_MATCH: {
    type:    "info",
    title:   () => "Việc làm phù hợp",
    message: (n) => n.body || "Có vị trí mới phù hợp với hồ sơ của bạn.",
  },

  JOB_SPOTLIGHT: {
    type:    "info",
    title:   () => "Việc làm nổi bật",
    message: (n) => n.body || "Có vị trí nổi bật dành cho bạn.",
  },

  // ── Employer nhận ──────────────────────────────────────────────────────────

  NEW_APPLICATION_RECEIVED: {
    type:    "success",
    title:   () => "Đơn ứng tuyển mới",
    message: (n) => n.body || "Có ứng viên mới vừa nộp đơn.",
  },

  JOB_POST_APPROVED: {
    type:    "success",
    title:   () => "Bài đăng được duyệt",
    message: (n) => n.body || "Bài đăng tuyển dụng của bạn đã được duyệt.",
  },

  JOB_POST_REJECTED: {
    type:    "error",
    title:   () => "Bài đăng bị từ chối",
    message: (n) => n.body || "Bài đăng tuyển dụng của bạn bị từ chối.",
  },

  JOB_POST_EXPIRING_SOON: {
    type:    "warning",
    title:   () => "Bài đăng sắp hết hạn",
    message: (n) => n.body || "Bài đăng tuyển dụng của bạn sắp hết hạn.",
  },

  SUBSCRIPTION_EXPIRING_SOON: {
    type:    "warning",
    title:   () => "Gói dịch vụ sắp hết hạn",
    message: (n) => n.body || "Gói dịch vụ của bạn sắp hết hạn.",
  },

  SUBSCRIPTION_EXPIRED: {
    type:    "error",
    title:   () => "Gói dịch vụ đã hết hạn",
    message: (n) => n.body || "Gói dịch vụ của bạn đã hết hạn.",
  },

  PAYMENT_SUCCESS: {
    type:    "success",
    title:   () => "Thanh toán thành công",
    message: (n) => n.body || "Thanh toán của bạn đã được xử lý thành công.",
  },

  PAYMENT_FAILED: {
    type:    "error",
    title:   () => "Thanh toán thất bại",
    message: (n) => n.body || "Có lỗi xảy ra trong quá trình thanh toán.",
  },

  COMPANY_VERIFIED: {
    type:    "success",
    title:   () => "Công ty được xác minh",
    message: (n) => n.body || "Công ty của bạn đã được xác minh.",
  },

  COMPANY_REJECTED: {
    type:    "error",
    title:   () => "Công ty bị từ chối",
    message: (n) => n.body || "Hồ sơ công ty của bạn bị từ chối.",
  },

  // ── Chung ──────────────────────────────────────────────────────────────────

  SYSTEM_ANNOUNCEMENT: {
    type:    "info",
    title:   (n) => n.title || "Thông báo hệ thống",
    message: (n) => n.body  || "",
  },

  REVIEW_APPROVED: {
    type:    "success",
    title:   () => "Đánh giá được duyệt",
    message: (n) => n.body || "Đánh giá của bạn đã được duyệt.",
  },

  REVIEW_REJECTED: {
    type:    "error",
    title:   () => "Đánh giá bị từ chối",
    message: (n) => n.body || "Đánh giá của bạn bị từ chối.",
  },

  // NEW_MESSAGE — badge only, không show toast (tránh spam khi chat)
  // INTERVIEW_INVITE — handled via INTERVIEW_SCHEDULED
};

// ── Component ─────────────────────────────────────────────────────────────────

export function NotificationToastListener() {
  const { subscribeToNewNotification } = useWebSocket();
  const toast = useToast();

  useEffect(() => {
    const unsubscribe = subscribeToNewNotification((notification: NotificationItem) => {
      const config = NOTIFICATION_TOAST_MAP[notification.type];

      // Type không có trong map → bỏ qua (NEW_MESSAGE, etc.)
      if (!config) return;

      toast[config.type](
        config.title(notification),
        config.message(notification),
        // JOB_INVITATION ở lâu hơn để candidate đọc kịp
        notification.type === "JOB_INVITATION"
          ? { duration: 8000 }
          : undefined,
      );
    });

    return unsubscribe;
  }, [subscribeToNewNotification, toast]);

  // Không render gì — chỉ là side-effect listener
  return null;
}