import api from "@/lib/axios";
import type { IEmployerPaymentRepository } from "@/domain/repositories/IEmployerPaymentRepository";
import type {
  EmployerPayment,
  EmployerPaymentFilters,
  EmployerPaymentPage,
} from "@/domain/models/EmployerPayment";

interface ApiResponse<T> {
  success: boolean;
  data:    T;
  message?: string;
}

export class EmployerPaymentRepository implements IEmployerPaymentRepository {
  private readonly BASE = "/payments/my";

  async listMyPayments(filters: EmployerPaymentFilters): Promise<EmployerPaymentPage> {
    const res = await api.get<ApiResponse<EmployerPaymentPage>>(
      this.BASE,
      {
        params: {
          page: filters.page,
          size: filters.size,
          ...(filters.status ? { status: filters.status } : {}),
        },
      },
    );
    return res.data.data;
  }

  async getMyPaymentDetail(id: string): Promise<EmployerPayment> {
    const res = await api.get<ApiResponse<EmployerPayment>>(`${this.BASE}/${id}`);
    return res.data.data;
  }
}