import type { CandidatePayment, PaymentListResponse, PaymentStatus } from '../models/CandidatePayment';
import { RetryPaymentResult } from '../models/PaymentShared';

export interface PaymentSearchParams {
  status?: PaymentStatus;
  gateway?: string;
  keyword?: string;
  fromDate?: string;   // ISO 8601
  toDate?: string;     // ISO 8601
  page?: number;
  size?: number;
}

export interface ICandidatePaymentRepository {
  getMyPayments(params: PaymentSearchParams): Promise<PaymentListResponse>;
  getMyPaymentDetail(id: string): Promise<CandidatePayment>;
  retryPayment(id: string): Promise<RetryPaymentResult>;
}