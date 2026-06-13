// ─── Backend enum (source of truth) ────────────

export type NotificationApiType =
  | "NEW_APPLICATION_RECEIVED"
  | "APPLICATION_STATUS_CHANGED"
  | "INTERVIEW_SCHEDULED"
  | "PAYMENT_SUCCESS"
  | "SUBSCRIPTION_EXPIRED"
  | "COMPANY_VERIFIED"
  | "COMPANY_REJECTED"
  | "JOB_POST_APPROVED"
  | "JOB_POST_REJECTED"
  | "SYSTEM_ANNOUNCEMENT"
  | "NEW_MESSAGE"
  |"JOB_INVITATION";

// ─── Frontend tab filter (UI only) ─────────────

export type NotificationTab = "ALL" | "NEW_JOB" | "MESSAGE" | "APPLY_RESULT" | "SYSTEM";

// ─── Domain model ─────────

export interface NotificationItem {
  notificationId: string;
  type:           NotificationApiType;
  title:          string;
  body:           string;
  link:           string | null;
  read:         boolean;
  readAt:         string | null;
  createdAt:      string;
  isStarred?:     boolean; // client-side only
}

export interface NotificationResult {
  notifications: NotificationItem[];
  unreadCount:   number;
}

// ─── Map backend type → tab ──────

export function typeToTab(type: NotificationApiType): NotificationTab {
  switch (type) {
    case "NEW_MESSAGE":
      return "MESSAGE";
    case "NEW_APPLICATION_RECEIVED":
    case "APPLICATION_STATUS_CHANGED":
    case "INTERVIEW_SCHEDULED":
      return "APPLY_RESULT";
    case "JOB_POST_APPROVED":
    case "JOB_POST_REJECTED":
      return "NEW_JOB";
    default:
      return "SYSTEM";
  }
}

// ─── Map backend type → badge metadata ─────────

export const TYPE_META: Record<
  NotificationApiType,
  { label: string; color: string; bg: string }
> = {
  NEW_APPLICATION_RECEIVED:   { label: "Ứng viên mới",       color: "text-blue-600",    bg: "bg-blue-50 border-blue-200"    },
  APPLICATION_STATUS_CHANGED: { label: "Kết quả ứng tuyển",  color: "text-green-600",   bg: "bg-green-50 border-green-200"  },
  INTERVIEW_SCHEDULED:        { label: "Phỏng vấn",          color: "text-purple-600",  bg: "bg-purple-50 border-purple-200"},
  PAYMENT_SUCCESS:            { label: "Thanh toán",         color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200"},
  SUBSCRIPTION_EXPIRED:       { label: "Gói hết hạn",        color: "text-red-600",     bg: "bg-red-50 border-red-200"      },
  COMPANY_VERIFIED:           { label: "Xác thực công ty",   color: "text-teal-600",    bg: "bg-teal-50 border-teal-200"    },
  COMPANY_REJECTED:           { label: "Từ chối xác thực",   color: "text-red-600",     bg: "bg-red-50 border-red-200"      },
  JOB_POST_APPROVED:          { label: "Tin được duyệt",     color: "text-blue-600",    bg: "bg-blue-50 border-blue-200"    },
  JOB_POST_REJECTED:          { label: "Tin bị từ chối",     color: "text-red-600",     bg: "bg-red-50 border-red-200"      },
  SYSTEM_ANNOUNCEMENT:        { label: "Hệ thống",           color: "text-gray-600",    bg: "bg-gray-50 border-gray-200"    },
  NEW_MESSAGE:                { label: "Tin nhắn",           color: "text-pink-600",    bg: "bg-pink-50 border-pink-200"    },
};