// D:\TLU_JOB_PLATFORM\frontend\src\domain\models\CandidateSubscription.ts

export type SubscriptionStatus = 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'PENDING' |'FAILED';

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
  jobAlertLimit: number;
  mockInterviewLimit: number;
  aiCvWriter: boolean;
  salaryInsights: boolean;
  profileAnalytics: boolean;
  advancedFilters: boolean;
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
  jobAlertQuota: CandidateQuota;
  mockInterviewQuota: CandidateQuota;
  aiCvWriter: boolean;
  salaryInsights: boolean;
  profileAnalytics: boolean;
  advancedFilters: boolean;
  currentPaymentId?: string;
  lastQuotaResetAt?: string;
  createdAt: string;
}

export interface CandidateQuotaResult {
  applicationQuota: CandidateQuota;
  cvBoostQuota: CandidateQuota;
  jobAlertQuota: CandidateQuota;
  mockInterviewQuota: CandidateQuota;
}

export interface PurchaseRequest {
  planId: string;
  yearly: boolean;
}

export interface PurchaseResult {
  paymentUrl: string;
  orderId: string;
}


export interface CandidatePlanPayload {
  code: string;
  name: string;
  description?: string;
  priceMonthly: number;
  priceYearly: number;
  applicationLimit: number;    
  cvBoostLimit: number;       
  jobAlertLimit: number;      
  mockInterviewLimit: number;  
  aiCvWriter: boolean;
  salaryInsights: boolean;
  profileAnalytics: boolean;
  advancedFilters: boolean;
  durationDays: number;
  free: boolean;
}

export interface CandidatePlanUpdatePayload {
  name?: string;
  description?: string;
  priceMonthly?: number;
  priceYearly?: number;
  applicationLimit?: number;
  cvBoostLimit?: number;
  jobAlertLimit?: number;
  mockInterviewLimit?: number;
  aiCvWriter?: boolean;
  salaryInsights?: boolean;
  profileAnalytics?: boolean;
  advancedFilters?: boolean;
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