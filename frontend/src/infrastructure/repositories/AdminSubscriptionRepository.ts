// src/infrastructure/repositories/AdminSubscriptionRepository.ts
import type { SubscriptionPlan } from "@/domain/models/CompanySubscription";
import type {
  IAdminSubscriptionRepository,
  PlanPayload,
  AdminSubscriptionRow,
  PageResult,
} from "@/domain/repositories/IAdminSubscriptionRepository";
import api from "@/lib/axios";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export class AdminSubscriptionRepository implements IAdminSubscriptionRepository {
  // GET    /api/v1/admin/subscription-plans
  // POST   /api/v1/admin/subscription-plans
  // PATCH  /api/v1/admin/subscription-plans/{planId}
  private readonly BASE = "/admin/subscription-plans";

  private async get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
    const res = await api.get<ApiResponse<T>>(url, { params });
    return res.data.data;
  }

  private async post<T>(url: string, body?: unknown): Promise<T> {
    const res = await api.post<ApiResponse<T>>(url, body);
    return res.data.data;
  }

  private async patch<T>(url: string, body?: unknown): Promise<T> {
    const res = await api.patch<ApiResponse<T>>(url, body);
    return res.data.data;
  }

  // Normalize a raw plan from the API: BigDecimal fields may arrive as strings
  // from some Jackson configs, so we coerce defensively.
  private normalize(p: SubscriptionPlan): SubscriptionPlan {
    return {
      ...p,
      priceMonthly: Number(p.priceMonthly),
      priceYearly:  Number(p.priceYearly),
    };
  }

  // ── Plans ────────────────────────────────────────────────────────────────

  async adminGetAllPlans(): Promise<SubscriptionPlan[]> {
    const plans = await this.get<SubscriptionPlan[]>(this.BASE);
    return plans.map(this.normalize);
  }

  async adminCreatePlan(payload: PlanPayload): Promise<SubscriptionPlan> {
    const plan = await this.post<SubscriptionPlan>(this.BASE, payload);
    return this.normalize(plan);
  }

  async adminUpdatePlan(id: string, payload: Partial<PlanPayload>): Promise<SubscriptionPlan> {
    const plan = await this.patch<SubscriptionPlan>(`${this.BASE}/${id}`, payload);
    return this.normalize(plan);
  }

  // Toggle active = PATCH với chỉ field { active: !currentlyActive }.
  // Backend không có endpoint /toggle riêng — dùng chung PATCH /{planId}.
  async adminTogglePlan(id: string, currentlyActive: boolean): Promise<SubscriptionPlan> {
    const plan = await this.patch<SubscriptionPlan>(`${this.BASE}/${id}`, {
      active: !currentlyActive,
    });
    return this.normalize(plan);
  }

  // ── Subscriptions ────────────────────────────────────────────────────────

  // Backend hiện KHÔNG có endpoint admin list subscriptions (chỉ có /my cho
  // employer). Trả về empty page để UI không crash — hiển thị banner thông báo.
  async adminListSubscriptions(
    _page = 0,
    _size = 20,
    _status?: string,
  ): Promise<PageResult<AdminSubscriptionRow>> {
    return { content: [], totalElements: 0, totalPages: 0 };
  }
}