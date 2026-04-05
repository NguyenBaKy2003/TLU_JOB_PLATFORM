// src/infrastructure/repositories/CompanySubscriptionRepository.ts

import type {
  SubscriptionPlan,
  CompanySubscription,
  QuotaResult,
  PurchaseResult,
  PurchasePayload,
} from "@/domain/models/CompanySubscription";
import { ICompanySubscriptionRepository } from "@/domain/repositories/ICompanySubscriptionRepository";
import api from "@/lib/axios";

interface ApiResponse<T> { success: boolean; data: T; message?: string; }

export class CompanySubscriptionRepository implements ICompanySubscriptionRepository {

  private readonly BASE = "/subscriptions";

  private async get<T>(url: string): Promise<T> {
    const res = await api.get<ApiResponse<T>>(url);
    return res.data.data;
  }

  private async post<T>(url: string, body?: unknown): Promise<T> {
    const res = await api.post<ApiResponse<T>>(url, body);
    return res.data.data;
  }

  /** GET /api/v1/subscriptions/plans */
  async getPlans(): Promise<SubscriptionPlan[]> {
    return this.get(`${this.BASE}/plans`);
  }

  /**
   * GET /api/v1/subscriptions/my
   * Backend trả về subscription | "Chưa có gói dịch vụ nào." (string)
   * → normalize thành null nếu là string
   */
  async getMySubscription(): Promise<CompanySubscription | null> {
    try {
      const raw = await this.get<CompanySubscription | string>(`${this.BASE}/my`);
      if (typeof raw === "string") return null;
      return raw;
    } catch {
      return null;
    }
  }

  /** GET /api/v1/subscriptions/my/quota */
  async getMyQuota(): Promise<QuotaResult> {
    return this.get(`${this.BASE}/my/quota`);
  }

  /**
   * POST /api/v1/subscriptions/purchase
   * → { payment, paymentUrl, orderCode }
   */
  async purchase(payload: PurchasePayload): Promise<PurchaseResult> {
    return this.post(`${this.BASE}/purchase`, payload);
  }
}