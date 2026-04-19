import type {
  EmployerPayment,
  EmployerPaymentFilters,
  EmployerPaymentPage,
} from "@/domain/models/EmployerPayment";

export interface IEmployerPaymentRepository {
  /** GET /api/v1/payments/my */
  listMyPayments(filters: EmployerPaymentFilters): Promise<EmployerPaymentPage>;

  /** GET /api/v1/payments/my/{id} */
  getMyPaymentDetail(id: string): Promise<EmployerPayment>;
}