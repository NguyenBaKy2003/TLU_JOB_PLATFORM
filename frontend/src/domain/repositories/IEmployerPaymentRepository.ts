import type { EmployerPayment, PaymentListResponse, PaymentStatus } from '../models/EmployerPayment';

export interface PaymentSearchParams {
  status?: PaymentStatus;
  gateway?: string;
  keyword?: string;
  fromDate?: string;   // ISO 8601
  toDate?: string;     // ISO 8601
  page?: number;
  size?: number;
}

export interface IEmployerPaymentRepository {
  getMyPayments(params: PaymentSearchParams): Promise<PaymentListResponse>;
  getMyPaymentDetail(id: string): Promise<EmployerPayment>;
}