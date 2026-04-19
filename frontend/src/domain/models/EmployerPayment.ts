export type PaymentStatus =
  | "PENDING"
  | "SUCCESS"
  | "FAILED"
  | "REFUNDED";

export interface EmployerPayment {
  id:        string;
  amount:    number;
  currency:  string;
  status:    PaymentStatus;
  gateway:   string | null;
  reason:    string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface EmployerPaymentPage {
  content:       EmployerPayment[];
  totalElements: number;
  totalPages:    number;
  number:        number;
  size:          number;
}

export interface EmployerPaymentFilters {
  status?: PaymentStatus | "";
  page:    number;
  size:    number;
}