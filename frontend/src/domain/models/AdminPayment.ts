export type PaymentStatus =
  | "PENDING"
  | "SUCCESS"
  | "FAILED"
  | "REFUNDED";

export interface AdminPayment {
  id:          string;
  companyId:   string;
  companyName: string;
  amount:      number;
  currency:    string;
  status:      PaymentStatus;
  gateway:     string | null;
  reason:      string | null;
  createdAt:   string;
  updatedAt:   string | null;
}

export interface AdminPaymentStats {
  totalRevenue:  number;
  totalCount:    number;
  pendingCount:  number;
  successCount:  number;
  failedCount:   number;
  from:          string;
  to:            string;
}

export interface AdminPaymentPage {
  content:       AdminPayment[];
  totalElements: number;
  totalPages:    number;
  number:        number;
  size:          number;
}

export interface AdminPaymentFilters {
  companyId?: string;
  status?:    PaymentStatus | "";
  gateway?:   string;
  fromDate?:  string; // ISO datetime
  toDate?:    string;
  page:       number;
  size:       number;
}