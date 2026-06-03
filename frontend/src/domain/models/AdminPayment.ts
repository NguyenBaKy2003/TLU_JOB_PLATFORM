export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';

export interface AdminPayment {
  id: string;
  companyId: string | null;
  companyName: string | null;
  candidateId: string | null;
  candidateName: string | null;
  subscriptionId: string | null;
  planCode: string | null;
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
  companyId?: string;
  candidateId?: string;
  gateway?: string;
  fromDate?: string;
  toDate?: string;
  page: number;
  size: number;
}

export interface AdminPaymentStats {
  totalRevenue: number;
  totalTransactions: number;
  successCount: number;
  failedCount: number;
  refundedCount: number;
  pendingCount: number;
  revenueTrend?: number;
  transactionsTrend?: number;
}