// src/domain/repositories/IAdminSubscriptionRepository.ts
import type { SubscriptionPlan } from "@/domain/models/CompanySubscription";

// ── Payload sent to backend when creating / updating a plan ───
// Prices are plain numbers; Spring's Jackson will deserialize into BigDecimal.
export interface PlanPayload {
  code: string;
  name: string;
  description?: string;
  priceMonthly: number;
  priceYearly: number;
  jobPostLimit: number;      // -1 = unlimited
  featuredJobLimit: number;  // -1 = unlimited
  cvViewLimit: number;       // -1 = unlimited
  aiFeatures: boolean;
  analyticsAccess: boolean;
  durationDays: number;
}

// ── Row returned by the admin subscriptions list endpoint ─────
export interface AdminSubscriptionRow {
  id: string;
  companyId: string;
  companyName: string;
  planCode: string;
  status: "ACTIVE" | "EXPIRED" | "CANCELLED" | "FAILED" | "PENDING";
  startedAt: string;   // ISO-8601
  expiresAt: string;   // ISO-8601
  amount: number;
}

// ── Page wrapper ─────────
export interface PageResult<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
}

// ── Repository contract ───
export interface IAdminSubscriptionRepository {
  /** GET /api/v1/admin/subscription-plans — all plans, including inactive */
  adminGetAllPlans(): Promise<SubscriptionPlan[]>;

  /** POST /api/v1/admin/subscription-plans */
  adminCreatePlan(payload: PlanPayload): Promise<SubscriptionPlan>;

  /**
   * PATCH /api/v1/admin/subscription-plans/{id}
   * Partial update — only send fields that changed.
   */
  adminUpdatePlan(id: string, payload: Partial<PlanPayload>): Promise<SubscriptionPlan>;

  /**
   * PATCH /api/v1/admin/subscription-plans/{id}  { active: !currentlyActive }
   * Toggle active flag. Caller supplies current state so repo can flip it.
   */
  adminTogglePlan(id: string, currentlyActive: boolean): Promise<SubscriptionPlan>;

  /** GET /api/v1/admin/subscriptions?page=&size=&status= */
  adminListSubscriptions(
    page?: number,
    size?: number,
    status?: string,
  ): Promise<PageResult<AdminSubscriptionRow>>;
}