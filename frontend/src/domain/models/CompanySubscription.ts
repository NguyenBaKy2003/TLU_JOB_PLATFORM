// src/domain/models/CompanySubscription.ts

// ── Enums ──

export type SubscriptionStatus = "ACTIVE" | "EXPIRED" | "CANCELLED" | "FAILED" | "PENDING";
export type PaymentStatus      = "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED";

// ── Value objects ─────────

export interface Quota {
  limit: number;   // -1 = unlimited
  used:  number;
}

// ── Domain models ─────────

export interface SubscriptionPlan {
  id:               string;
  code:             string;        // "FREE" | "BASIC" | "PRO" | "ENTERPRISE"
  name:             string;
  description:      string | null;
  priceMonthly:     number;
  priceYearly:      number;
  jobPostLimit:     number;        // -1 = unlimited
  featuredJobLimit: number;
  cvViewLimit:      number;
  aiFeatures:       boolean;
  analyticsAccess:  boolean;
  durationDays:     number;
  active:           boolean;
}

export interface CompanySubscription {
  id:                 string;
  companyId:          string;
  planId:             string;
  planCode:           string;
  startedAt:          string;
  expiresAt:          string;
  status:             SubscriptionStatus;
  jobPostQuota:       Quota;
  featuredJobQuota:   Quota;
  cvViewQuota:        Quota;
  aiFeatures:         boolean;
  analyticsAccess:    boolean;
  currentPaymentId:   string | null;
  createdAt:          string;
  // Computed from backend
  daysRemaining?:     number;
  active?:            boolean;
}

export interface QuotaResult {
  canPostJob:      boolean;
  canPostFeatured: boolean;
  canViewCv:       boolean;
  jobPostQuota:    Quota;
  featuredJobQuota:Quota;
  cvViewQuota:     Quota;
  daysRemaining:   number;
}

// ── Payment 

export interface Payment {
  id:                    string;
  companyId:             string;
  subscriptionId:        string;
  planCode:              string;
  amount:                number;
  currency:              string;
  gateway:               string;  // "VNPAY" | "MOMO"
  gatewayOrderCode:      string;
  status:                PaymentStatus;
  gatewayTransactionId:  string | null;
  failureReason:         string | null;
  completedAt:           string | null;
  createdAt:             string;
}

export interface PurchaseResult {
  payment:    Payment;
  paymentUrl: string;  // VNPay redirect URL
  orderCode:  string;
}

// ── Payloads ──────────────

export interface PurchasePayload {
  planId:  string;
  yearly:  boolean;
}

// ── UI helpers ────────────

export const PLAN_HIGHLIGHTS: Record<string, string[]> = {
  FREE:       ["5 tin đăng / tháng", "Tìm kiếm cơ bản", "Hỗ trợ email"],
  BASIC:      ["20 tin đăng / tháng", "5 tin nổi bật", "100 lượt xem CV", "Hỗ trợ ưu tiên"],
  PRO:        ["Không giới hạn tin đăng", "20 tin nổi bật", "500 lượt xem CV", "AI gợi ý ứng viên", "Phân tích nâng cao"],
  ENTERPRISE: ["Không giới hạn tất cả", "Tin nổi bật ưu tiên", "Xem CV không giới hạn", "AI & Analytics đầy đủ", "Hỗ trợ 24/7 riêng"],
};

export const PLAN_BADGE: Record<string, { label: string; cls: string } | undefined> = {
  PRO:        { label: "Phổ biến", cls: "bg-blue-600 text-white"    },
  ENTERPRISE: { label: "Cao cấp",  cls: "bg-amber-500 text-white"   },
};

export function formatQuota(q: Quota): string {
  if (q?.limit === -1) return "Không giới hạn";
  return `${q?.used}/${q?.limit}`;
}

export function quotaPercent(q: Quota): number {
  if (q?.limit === -1 || q?.limit === 0) return 0;
  return Math.min(100, Math.round((q?.used / q?.limit) * 100));
}