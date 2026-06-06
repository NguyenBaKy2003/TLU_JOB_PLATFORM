// src/domain/models/AuditLog.ts

export type AuditLogResult = "SUCCESS" | "FAILURE";

export interface AuditLog {
  id:            number;
  actorId:       string;
  action:        string;
  resourceType:  string | null;
  resourceId:    string | null;
  result:        AuditLogResult;
  errorMessage:  string | null;
  ipAddress:     string | null;
  traceId:       string | null;
  occurredAt:    string;
}

export interface AuditLogPage {
  content:       AuditLog[];
  totalElements: number;
  totalPages:    number;
  page:          number;
  size:          number;
  first:         boolean;
  last:          boolean;
  empty:         boolean;
}

// Filters dùng cho /me/audit-logs
export interface MyAuditLogFilters {
  action?:       string;
  resourceType?: string;
  result?:       AuditLogResult | "";
  from?:         string; // ISO datetime
  to?:           string;
  page:          number;
  size:          number;
}

// Filters dùng cho admin
export interface AdminAuditLogFilters {
  actorId?:      string;
  action?:       string;
  resourceType?: string;
  result?:       AuditLogResult | "";
  from?:         string;
  to?:           string;
  page:          number;
  size:          number;
}

// Action groups để hiển thị badge / icon
export const AUDIT_ACTION_LABELS: Record<string, string> = {
  USER_LOGIN:                      "Đăng nhập",
  USER_LOGOUT:                     "Đăng xuất",
  USER_CHANGE_PASSWORD:            "Đổi mật khẩu",
  USER_UPDATE_PROFILE:             "Cập nhật hồ sơ",
  CANDIDATE_SUBMIT_APPLICATION:    "Nộp đơn ứng tuyển",
  CANDIDATE_WITHDRAW_APPLICATION:  "Rút đơn ứng tuyển",
  CANDIDATE_UPLOAD_CV:             "Tải lên CV",
  CANDIDATE_SAVE_JOB:              "Lưu việc làm",
  CANDIDATE_UNSAVE_JOB:            "Bỏ lưu việc làm",
  EMPLOYER_CREATE_JOB_POST:        "Tạo tin tuyển dụng",
  EMPLOYER_UPDATE_JOB_POST:        "Cập nhật tin tuyển dụng",
  EMPLOYER_CLOSE_JOB_POST:         "Đóng tin tuyển dụng",
  EMPLOYER_DELETE_JOB_POST:        "Xóa tin tuyển dụng",
  EMPLOYER_SUBMIT_JOB_POST:        "Gửi duyệt tin tuyển dụng",
  ADMIN_APPROVE_COMPANY:           "Duyệt công ty",
  ADMIN_REJECT_COMPANY:            "Từ chối công ty",
  ADMIN_APPROVE_JOB_POST:          "Duyệt tin tuyển dụng",
  ADMIN_REJECT_JOB_POST:           "Từ chối tin tuyển dụng",
  ADMIN_TOGGLE_USER_ACTIVE:        "Thay đổi trạng thái user",
};