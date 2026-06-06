
import type {
   AuditLogPage,
  MyAuditLogFilters, AdminAuditLogFilters,
} from "@/domain/models/AuditLog";

export interface IAuditLogRepository {
  // /me/audit-logs — candidate / employer / admin xem log của chính mình
  getMyLogs(filters: MyAuditLogFilters): Promise<AuditLogPage>;

  // /admin/audit-logs — admin xem toàn bộ
  adminListAll(filters: AdminAuditLogFilters): Promise<AuditLogPage>;
  adminGetByUser(userId: string, action: string | undefined, page: number, size: number): Promise<AuditLogPage>;
  adminGetByResource(resourceType: string, resourceId: string, page: number, size: number): Promise<AuditLogPage>;
  adminGetStats(from?: string, to?: string): Promise<Record<string, number>>;
}