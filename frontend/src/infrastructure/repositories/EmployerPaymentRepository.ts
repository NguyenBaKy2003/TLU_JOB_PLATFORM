import api from "@/lib/axios";
import type { IEmployerPaymentRepository, PaymentSearchParams } from "@/domain/repositories/IEmployerPaymentRepository";
import type { EmployerPayment, PaymentListResponse } from "@/domain/models/EmployerPayment";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp?: string;
}

export class EmployerPaymentRepository implements IEmployerPaymentRepository {
  private readonly BASE = "/payments";

  async getMyPayments(params: PaymentSearchParams): Promise<PaymentListResponse> {
    const query: Record<string, unknown> = {
      page: params.page ?? 0,
      size: params.size ?? 10,
    };
    if (params.status)   query.status   = params.status;
    if (params.gateway)  query.gateway  = params.gateway;
    if (params.keyword)  query.keyword  = params.keyword;
    if (params.fromDate) query.fromDate = `${params.fromDate}T00:00:00`;
    if (params.toDate)   query.toDate   = `${params.toDate}T23:59:59`;

    const res = await api.get<ApiResponse<PaymentListResponse>>(`${this.BASE}/my`, { params: query });
    return res.data.data;
  }

  async getMyPaymentDetail(id: string): Promise<EmployerPayment> {
    const res = await api.get<ApiResponse<EmployerPayment>>(`${this.BASE}/my/${id}`);
    return res.data.data;
  }
}