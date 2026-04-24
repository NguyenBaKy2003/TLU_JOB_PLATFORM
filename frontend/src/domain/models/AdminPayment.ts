export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';

export interface AdminPayment {
  id: string;
  companyId: string;
  companyName: string;
  subscriptionId: string;
  planCode: string;
  amount: number;
  currency: string;
  amountFormatted: string;
  gateway: string | null;
  gatewayOrderCode: string;
  gatewayTransactionId: string | null;
  status: PaymentStatus;
  statusLabel: string;
  statusColor: string;
  failureReason: string | null;
  createdAt: string;
  completedAt: string | null;
}

export interface AdminPaymentPage {
  content: AdminPayment[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface AdminPaymentFilters {
  status?: PaymentStatus;
  planCode?: string;
  page: number;
  size: number;
}

export interface AdminPaymentStats {
  totalRevenue: number;
  totalTransactions: number;
  successCount: number;
  failedCount: number;
  revenueTrend?: number;
  transactionsTrend?: number;
}