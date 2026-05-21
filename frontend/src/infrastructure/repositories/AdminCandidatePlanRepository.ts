// D:\TLU_JOB_PLATFORM\frontend\src\infrastructure\repositories\AdminCandidatePlanRepository.ts

import api from "@/lib/axios";
import { getAdminAccessToken } from "@/lib/auth-helpers";
import type { IAdminCandidatePlanRepository } from "@/domain/repositories/IAdminCandidatePlanRepository";
import type {
  CandidateSubscriptionPlan,
  CandidatePlanPayload,
  CandidatePlanUpdatePayload,
} from "@/domain/models/CandidateSubscription";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

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

async function patch<T>(url: string, body?: unknown): Promise<T> {
  const res = await api.patch<ApiResponse<T>>(url, body ?? null, adminCfg());
  return res.data.data;
}

export class AdminCandidatePlanRepository implements IAdminCandidatePlanRepository {
  private readonly BASE = "/admin/candidate-plans";

  /** GET /api/v1/admin/candidate-plans */
  adminGetAllPlans(): Promise<CandidateSubscriptionPlan[]> {
    return get(this.BASE);
  }

  /** POST /api/v1/admin/candidate-plans */
  adminCreatePlan(payload: CandidatePlanPayload): Promise<CandidateSubscriptionPlan> {
    return post(this.BASE, payload);
  }

  /** PATCH /api/v1/admin/candidate-plans/{id} */
  adminUpdatePlan(
    id: string,
    payload: CandidatePlanUpdatePayload,
  ): Promise<CandidateSubscriptionPlan> {
    return patch(`${this.BASE}/${id}`, payload);
  }

  /** PATCH /api/v1/admin/candidate-plans/{id}  body: { active: !currentlyActive } */
  adminTogglePlan(id: string, currentlyActive: boolean): Promise<CandidateSubscriptionPlan> {
    return patch(`${this.BASE}/${id}`, { active: !currentlyActive });
  }
}