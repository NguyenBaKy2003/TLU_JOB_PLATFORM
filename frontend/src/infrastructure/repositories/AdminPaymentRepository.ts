import api from "@/lib/axios";
import { getAdminAccessToken } from "@/lib/auth-helpers";
import type { IAdminPaymentRepository } from "@/domain/repositories/IAdminPaymentRepository";
import type {
  AdminPayment,
  AdminPaymentFilters,
  AdminPaymentPage,
  AdminPaymentStats,
} from "@/domain/models/AdminPayment";

interface ApiResponse<T> {
  success: boolean;
  data:    T;
  message?: string;
}

function adminConfig(params?: Record<string, unknown>) {
  const token = getAdminAccessToken();
  return {
    ...(params ? { params } : {}),
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  };
}

export class AdminPaymentRepository implements IAdminPaymentRepository {
  private readonly BASE = "/admin/payments";

  async search(filters: AdminPaymentFilters): Promise<AdminPaymentPage> {
    const res = await api.get<ApiResponse<AdminPaymentPage>>(
      this.BASE,
      adminConfig({
        page:      filters.page,
        size:      filters.size,
        ...(filters.companyId ? { companyId: filters.companyId } : {}),
        ...(filters.status    ? { status:    filters.status    } : {}),
        ...(filters.gateway   ? { gateway:   filters.gateway   } : {}),
        ...(filters.fromDate  ? { fromDate:  filters.fromDate  } : {}),
        ...(filters.toDate    ? { toDate:    filters.toDate    } : {}),
      }),
    );
    return res.data.data;
  }

  async getStats(from: string, to: string): Promise<AdminPaymentStats> {
    const res = await api.get<ApiResponse<AdminPaymentStats>>(
      `${this.BASE}/stats`,
      adminConfig({ from, to }),
    );
    return res.data.data;
  }

  async getById(id: string): Promise<AdminPayment> {
    const res = await api.get<ApiResponse<AdminPayment>>(
      `${this.BASE}/${id}`,
      adminConfig(),
    );
    return res.data.data;
  }

  async getByCompany(companyId: string, filters: AdminPaymentFilters): Promise<AdminPaymentPage> {
    const res = await api.get<ApiResponse<AdminPaymentPage>>(
      `${this.BASE}/company/${companyId}`,
      adminConfig({
        page: filters.page,
        size: filters.size,
        ...(filters.status ? { status: filters.status } : {}),
      }),
    );
    return res.data.data;
  }

  async refund(id: string, reason: string): Promise<AdminPayment> {
    const res = await api.post<ApiResponse<AdminPayment>>(
      `${this.BASE}/${id}/refund`,
      null,
      adminConfig({ reason }),
    );
    return res.data.data;
  }
}