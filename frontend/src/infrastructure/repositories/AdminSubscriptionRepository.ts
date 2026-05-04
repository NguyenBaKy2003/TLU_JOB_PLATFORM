// src/infrastructure/repositories/AdminSubscriptionRepository.ts
import api from "@/lib/axios";
import { getAdminAccessToken }              from "@/lib/auth-helpers";
import type { IAdminSubscriptionRepository,
  PlanPayload, AdminSubscriptionRow,
  PageResult }                              from "@/domain/repositories/IAdminSubscriptionRepository";
import type { SubscriptionPlan }            from "@/domain/models/CompanySubscription";

interface ApiResponse<T> { success: boolean; data: T; message?: string; }

// ── Helper: inject adminAccessToken, skip shared interceptor ──

function adminCfg(params?: Record<string, unknown>) {
  const token = getAdminAccessToken();
  return {
    ...(params ? { params } : {}),
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  };
}

async function get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
  const res = await api.get<ApiResponse<T>>(url, adminCfg(params));
  return res.data.data;
}
async function post<T>(url: string, body: unknown): Promise<T> {
  const res = await api.post<ApiResponse<T>>(url, body, adminCfg());
  return res.data.data;
}
async function put<T>(url: string, body: unknown): Promise<T> {
  const res = await api.put<ApiResponse<T>>(url, body, adminCfg());
  return res.data.data;
}
async function patch<T>(url: string, body?: unknown, params?: Record<string, unknown>): Promise<T> {
  const res = await api.patch<ApiResponse<T>>(url, body ?? null, adminCfg(params));
  return res.data.data;
}

// ── Repository ────────────

export class AdminSubscriptionRepository implements IAdminSubscriptionRepository {
  private readonly PLANS = "/admin/subscription-plans";
  private readonly SUBS  = "/admin/subscriptions";

  adminGetAllPlans(): Promise<SubscriptionPlan[]> {
    return get(this.PLANS);
  }

  adminCreatePlan(payload: PlanPayload): Promise<SubscriptionPlan> {
    return post(this.PLANS, payload);
  }

  adminUpdatePlan(id: string, payload: Partial<PlanPayload>): Promise<SubscriptionPlan> {
    return patch(`${this.PLANS}/${id}`, payload);
  }

  /** PATCH /…/{id}  body: { active: !currentlyActive } */
  adminTogglePlan(id: string, currentlyActive: boolean): Promise<SubscriptionPlan> {
    return patch(`${this.PLANS}/${id}`, { active: !currentlyActive });
  }

  adminListSubscriptions(
    page = 0, size = 20, status?: string,
  ): Promise<PageResult<AdminSubscriptionRow>> {
    return get(this.SUBS, {
      page, size,
      ...(status ? { status } : {}),
    });
  }
}