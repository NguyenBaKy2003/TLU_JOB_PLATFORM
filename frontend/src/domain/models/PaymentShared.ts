// src/domain/models/PaymentShared.ts

export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED";

export interface PaymentSearchParams {
  status?: PaymentStatus;
  gateway?: string;
  keyword?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  size?: number;
}

export interface RetryPaymentResult {
  paymentId: string;
  orderCode: string;
  paymentUrl: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp?: string;
}

// Mixin chứa toàn bộ fields chung của Payment
export interface BasePayment {
  id: string;
  planCode: string;
  amount: number;
  currency: string;
  gateway: string;
  gatewayOrderCode: string;
  gatewayTransactionId: string | null;
  status: PaymentStatus;
  failureReason: string | null;
  createdAt: string;
  completedAt: string | null;
}

export interface PageMeta {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface PageResponse<T> {
  content: T[];
  meta: PageMeta;
}