import type { IAdminPaymentRepository } from "@/domain/repositories/IAdminPaymentRepository";
import type {
  AdminPayment,
  AdminPaymentFilters,
  AdminPaymentPage,
  AdminPaymentStats,
} from "@/domain/models/AdminPayment";

export class AdminPaymentService {
  constructor(private readonly repo: IAdminPaymentRepository) {}

  search(filters: AdminPaymentFilters): Promise<AdminPaymentPage> {
    return this.repo.search(filters);
  }

  getStats(from: string, to: string): Promise<AdminPaymentStats> {
    return this.repo.getStats(from, to);
  }

  getById(id: string): Promise<AdminPayment> {
    return this.repo.getById(id);
  }

  getByCompany(companyId: string, filters: AdminPaymentFilters): Promise<AdminPaymentPage> {
    if (!companyId) throw new Error("companyId là bắt buộc");
    return this.repo.getByCompany(companyId, filters);
  }

  refund(id: string, reason: string): Promise<AdminPayment> {
    if (!reason?.trim()) throw new Error("Lý do hoàn tiền không được để trống");
    return this.repo.refund(id, reason.trim());
  }
}