import type {
  AdminPayment,
  AdminPaymentFilters,
  AdminPaymentPage,
  AdminPaymentStats,
} from "@/domain/models/AdminPayment";

export interface IAdminPaymentRepository {
  /** GET /api/v1/admin/payments */
  search(filters: AdminPaymentFilters): Promise<AdminPaymentPage>;

  /** GET /api/v1/admin/payments/stats?from=&to= */
  getStats(from: string, to: string): Promise<AdminPaymentStats>;

  /** GET /api/v1/admin/payments/{id} */
  getById(id: string): Promise<AdminPayment>;

  /** GET /api/v1/admin/payments/company/{companyId} */
  getByCompany(companyId: string, filters: AdminPaymentFilters): Promise<AdminPaymentPage>;

  /** POST /api/v1/admin/payments/{id}/refund?reason= */
  refund(id: string, reason: string): Promise<AdminPayment>;

  /** GET /api/v1/admin/payments/export/excel — returns Blob */
  exportExcel(filters: Omit<AdminPaymentFilters, 'page' | 'size'>): Promise<Blob>;

  /** GET /api/v1/admin/payments/export/pdf — returns Blob */
  exportPdf(filters: Omit<AdminPaymentFilters, 'page' | 'size'>): Promise<Blob>;

  /** GET /api/v1/admin/payments/{id}/invoice — returns Blob */
  downloadInvoice(id: string): Promise<Blob>;
}