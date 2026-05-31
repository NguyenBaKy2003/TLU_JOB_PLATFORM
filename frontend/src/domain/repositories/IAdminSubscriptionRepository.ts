import type { SubscriptionPlan } from "@/domain/models/CompanySubscription";

export interface PlanPayload {
  code:             string;
  name:             string;
  description?:     string;
  priceMonthly:     number;
  priceYearly:      number;
  jobPostLimit:     number;
  featuredJobLimit: number;
  cvViewLimit:      number;
  aiFeatures:       boolean;
  analyticsAccess:  boolean;
  durationDays:     number;
}

export interface AdminSubscriptionRow {
  id:          string;
  companyId:   string;
  companyName: string;
  planCode:    string;
  status:      "ACTIVE" | "EXPIRED" | "CANCELLED" | "FAILED" | "PENDING";
  startedAt:   string;
  expiresAt:   string;
  amount:      number;
}

export interface PageResult<T> {
  content:       T[];
  totalElements: number;
  totalPages:    number;
}

export interface IAdminSubscriptionRepository {
  adminGetAllPlans(): Promise<SubscriptionPlan[]>;
  adminCreatePlan(payload: PlanPayload): Promise<SubscriptionPlan>;
  adminUpdatePlan(id: string, payload: Partial<PlanPayload>): Promise<SubscriptionPlan>;
  adminTogglePlan(id: string, currentlyActive: boolean): Promise<SubscriptionPlan>;
  adminListSubscriptions(page?: number, size?: number, status?: string): Promise<PageResult<AdminSubscriptionRow>>;
  exportExcel(): Promise<Blob>;   // ← thêm
  exportPdf(): Promise<Blob>;     // ← thêm
}