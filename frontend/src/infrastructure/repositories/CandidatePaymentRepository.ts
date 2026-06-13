import api from "@/lib/axios";
import type { ICandidatePaymentRepository, PaymentSearchParams } from "@/domain/repositories/ICandidatePaymentRepository";
import type { CandidatePayment, PaymentListResponse } from "@/domain/models/CandidatePayment";
import { RetryPaymentResult } from "@/domain/models/PaymentShared";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp?: string;
}
export class CandidatePaymentRepository implements ICandidatePaymentRepository {
  private readonly BASE = "/payments/candidate";

  async getMyPayments(params: PaymentSearchParams): Promise<PaymentListResponse> {
    const query: Record<string, unknown> = {
      page: params.page ?? 0,
      size: params.size ?? 10,
    };
    if (params.status)   query.status   = params.status;
    if (params.gateway)  query.gateway  = params.gateway;
    if (params.keyword)  query.keyword  = params.keyword;

    // Convert "2026-05-29" → "2026-05-29T00:00:00" và "2026-05-29" → "2026-05-29T23:59:59"
    if (params.fromDate) query.fromDate = `${params.fromDate}T00:00:00`;
    if (params.toDate)   query.toDate   = `${params.toDate}T23:59:59`;

    const res = await api.get<ApiResponse<PaymentListResponse>>(
      `${this.BASE}/my`, { params: query }
    );
    return res.data.data;
  }

  async getMyPaymentDetail(id: string): Promise<CandidatePayment> {
    const res = await api.get<ApiResponse<CandidatePayment>>(`${this.BASE}/my/${id}`);
    return res.data.data;
  }

    async retryPayment(id: string): Promise<RetryPaymentResult> {
    const res = await api.post<ApiResponse<RetryPaymentResult>>(
      `${this.BASE}/my/${id}/retry`
    );
    return res.data.data;
  }
}