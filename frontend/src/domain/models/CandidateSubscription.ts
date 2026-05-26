// D:\TLU_JOB_PLATFORM\frontend\src\domain\models\CandidateSubscription.ts

export type SubscriptionStatus = 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'PENDING' | 'FAILED';

export interface CandidateQuota {
  limit: number;
  used: number;
}

export interface CandidateSubscriptionPlan {
  id: string;
  code: string;
  name: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  applicationLimit: number;
  cvBoostLimit: number;
  /** Số CV online có thể tạo đồng thời. -1 = unlimited */
  cvCreateLimit: number;
  /** AI viết & tối ưu CV theo JD — chỉ PREMIUM */
  aiCvWriter: boolean;
  /** Được dùng template premium khi tạo CV online */
  premiumTemplateAccess: boolean;
  durationDays: number;
  active: boolean;
  free: boolean;
}

export interface CandidateSubscription {
  id: string;
  candidateId: string;
  planId: string;
  planCode: string;
  yearly: boolean;
  startedAt: string;
  expiresAt: string;
  status: SubscriptionStatus;
  applicationQuota: CandidateQuota;
  cvBoostQuota: CandidateQuota;
  /** Quota tạo CV online */
  cvCreateQuota: CandidateQuota;
  aiCvWriter: boolean;
  premiumTemplateAccess: boolean;
  currentPaymentId?: string;
  lastQuotaResetAt?: string;
  createdAt: string;
}

export interface CandidateQuotaResult {
  applicationQuota: CandidateQuota;
  cvBoostQuota: CandidateQuota;
  cvCreateQuota: CandidateQuota;
}

export interface PurchaseRequest {
  planId: string;
  yearly: boolean;
}

export interface PurchaseResult {
  paymentUrl: string;
  orderId: string;
}

/** Payload cho POST /api/v1/admin/candidate-plans */
export interface CandidatePlanPayload {
  code: string;
  name: string;
  description?: string;
  /** null nếu là gói free */
  priceMonthly: number | null;
  priceYearly: number | null;
  /** Số đơn ứng tuyển / tháng. -1 = unlimited */
  applicationLimit: number;
  /** Số lần boost CV lên top / tháng. 0 = không có */
  cvBoostLimit: number;
  /** Số CV online có thể tạo đồng thời. -1 = unlimited */
  cvCreateLimit: number;
  /** AI viết & tối ưu CV theo JD */
  aiCvWriter: boolean;
  /** Được dùng template premium khi tạo CV online */
  premiumTemplateAccess: boolean;
  /** null nếu gói free không có thời hạn */
  durationDays: number | null;
  active: boolean;
  free: boolean;
}

/** Payload cho PATCH /api/v1/admin/candidate-plans/{planId} */
export interface CandidatePlanUpdatePayload {
  name?: string;
  description?: string;
  priceMonthly?: number;
  priceYearly?: number;
  applicationLimit?: number;
  cvBoostLimit?: number;
  cvCreateLimit?: number;
  aiCvWriter?: boolean;
  premiumTemplateAccess?: boolean;
  durationDays?: number;
  active?: boolean;
}

export interface CandidateSubscriptionRow {
  id: string;
  candidateId: string;
  candidateName: string;
  planCode: string;
  status: SubscriptionStatus;
  yearly: boolean;
  startedAt: string;
  expiresAt: string;
  amount: number;
}

export interface PageResult<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
}