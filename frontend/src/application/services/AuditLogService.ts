// src/application/services/AuditLogService.ts

import type { IAuditLogRepository } from "@/domain/repositories/IAuditLogRepository";
import type {
  AuditLogPage, MyAuditLogFilters, AdminAuditLogFilters,
} from "@/domain/models/AuditLog";

export class AuditLogService {
  constructor(private readonly repo: IAuditLogRepository) {}

  // ── Candidate / Employer / Admin — xem log của mình ──────────────────────

  getMyLogs(filters: MyAuditLogFilters): Promise<AuditLogPage> {
    return this.repo.getMyLogs(filters);
  }

  // ── Admin only ────────────────────────────────────────────────────────────

  adminListAll(filters: AdminAuditLogFilters): Promise<AuditLogPage> {
    return this.repo.adminListAll(filters);
  }

  adminGetByUser(
    userId: string,
    action: string | undefined,
    page = 0,
    size = 20,
  ): Promise<AuditLogPage> {
    return this.repo.adminGetByUser(userId, action, page, size);
  }

  adminGetByResource(
    resourceType: string,
    resourceId: string,
    page = 0,
    size = 20,
  ): Promise<AuditLogPage> {
    return this.repo.adminGetByResource(resourceType, resourceId, page, size);
  }

  adminGetStats(from?: string, to?: string): Promise<Record<string, number>> {
    return this.repo.adminGetStats(from, to);
  }
}