import api from "@/lib/axios";
import { getAdminAccessToken } from "@/lib/auth-helpers";
import type {
  IAdminCandidateSubscriptionRepository,
  AdminCandidateSubscriptionRow, PageResult,
} from "@/domain/repositories/IAdminCandidateSubscriptionRepository";

interface ApiResponse<T> { success: boolean; data: T; }

function adminConfig(params?: Record<string, unknown>) {
  const token = getAdminAccessToken();
  return {
    ...(params ? { params } : {}),
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  };
}

function adminBlobConfig() {
  const token = getAdminAccessToken();
  return {
    responseType: "blob" as const,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  };
}

export class AdminCandidateSubscriptionRepository
  implements IAdminCandidateSubscriptionRepository {

  private readonly BASE = "/admin/candidate-subscriptions";

  async listSubscriptions(
    page = 0, size = 20, status?: string,
  ): Promise<PageResult<AdminCandidateSubscriptionRow>> {
    const res = await api.get<ApiResponse<PageResult<AdminCandidateSubscriptionRow>>>(
      this.BASE,
      adminConfig({ page, size, ...(status ? { status } : {}) }),
    );
    return res.data.data;
  }

  async exportExcel(): Promise<Blob> {
    const res = await api.get<Blob>(`${this.BASE}/export/excel`, adminBlobConfig());
    return res.data;
  }

  async exportPdf(): Promise<Blob> {
    const res = await api.get<Blob>(`${this.BASE}/export/pdf`, adminBlobConfig());
    return res.data;
  }
}