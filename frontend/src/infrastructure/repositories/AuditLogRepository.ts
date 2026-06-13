
import api from "@/lib/axios";
import type { IAuditLogRepository } from "@/domain/repositories/IAuditLogRepository";
import type {
  AuditLogPage, MyAuditLogFilters, AdminAuditLogFilters,
} from "@/domain/models/AuditLog";
import { getAdminAccessToken } from "@/lib/auth-helpers";

interface ApiResponse<T> { success: boolean; data: T; message?: string; }

function clean(params: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== "" && v !== undefined && v !== null),
  );
}
function adminConfig(params?: Record<string, unknown>) {
  const token = getAdminAccessToken();
  return {
    ...(params ? { params: clean(params) } : {}),
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  };
}
export class AuditLogRepository implements IAuditLogRepository {

  private async get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
    const res = await api.get<ApiResponse<T>>(url, { params: params ? clean(params) : undefined });
    return res.data.data;
  }

  // ── /me/audit-logs 

  async getMyLogs(f: MyAuditLogFilters): Promise<AuditLogPage> {
    return this.get("/me/audit-logs", {
      action:       f.action,
      resourceType: f.resourceType,
      result:       f.result,
      from:         f.from,
      to:           f.to,
      page:         f.page,
      size:         f.size,
    });
  }

  // ── /admin/audit-logs ─────────────────────────
async adminListAll(f: AdminAuditLogFilters): Promise<AuditLogPage> {
    const res = await api.get<ApiResponse<AuditLogPage>>(
      "/admin/audit-logs",
      adminConfig({
        actorId:      f.actorId,
        action:       f.action,
        resourceType: f.resourceType,
        result:       f.result,
        from:         f.from,
        to:           f.to,
        page:         f.page,
        size:         f.size,
      }),
    );
    return res.data.data;
  }

  /** Log của 1 user cụ thể */
  async adminGetByUser(
    userId: string,
    action: string | undefined,
    page: number,
    size: number,
  ): Promise<AuditLogPage> {
    const res = await api.get<ApiResponse<AuditLogPage>>(
      `/admin/audit-logs/user/${userId}`,
      adminConfig({ action, page, size }),
    );
    return res.data.data;
  }

  /** Log của 1 entity cụ thể */
  async adminGetByResource(
    resourceType: string,
    resourceId: string,
    page: number,
    size: number,
  ): Promise<AuditLogPage> {
    const res = await api.get<ApiResponse<AuditLogPage>>(
      `/admin/audit-logs/resource/${resourceType}/${resourceId}`,
      adminConfig({ page, size }),
    );
    return res.data.data;
  }

  /** Thống kê action counts — mặc định 7 ngày gần nhất */
  async adminGetStats(from?: string, to?: string): Promise<Record<string, number>> {
    const res = await api.get<ApiResponse<Record<string, number>>>(
      "/admin/audit-logs/stats",
      adminConfig({ from, to }),
    );
    return res.data.data;
  }
}