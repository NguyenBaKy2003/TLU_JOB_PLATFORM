import type { IEmployerPaymentRepository } from "@/domain/repositories/IEmployerPaymentRepository";
import type {
  EmployerPayment,
  EmployerPaymentFilters,
  EmployerPaymentPage,
} from "@/domain/models/EmployerPayment";

export class EmployerPaymentService {
  constructor(private readonly repo: IEmployerPaymentRepository) {}

  listMyPayments(filters: EmployerPaymentFilters): Promise<EmployerPaymentPage> {
    return this.repo.listMyPayments(filters);
  }

  getMyPaymentDetail(id: string): Promise<EmployerPayment> {
    return this.repo.getMyPaymentDetail(id);
  }
}