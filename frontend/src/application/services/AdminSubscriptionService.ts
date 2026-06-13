import { triggerBlobDownload } from "@/lib/download";
import type { SubscriptionPlan } from "@/domain/models/CompanySubscription";
import type {
  IAdminSubscriptionRepository, PlanPayload,
  AdminSubscriptionRow, PageResult,
} from "@/domain/repositories/IAdminSubscriptionRepository";
export class AdminSubscriptionService {
  constructor(private readonly repo: IAdminSubscriptionRepository) {}

  // ── Plans ─────────

  getAllPlans(): Promise<SubscriptionPlan[]> {
    return this.repo.adminGetAllPlans();
  }

  createPlan(payload: PlanPayload): Promise<SubscriptionPlan> {
    return this.repo.adminCreatePlan(payload);
  }

  updatePlan(id: string, payload: Partial<PlanPayload>): Promise<SubscriptionPlan> {
    return this.repo.adminUpdatePlan(id, payload);
  }

  toggleActive(plan: SubscriptionPlan): Promise<SubscriptionPlan> {
    return this.repo.adminTogglePlan(plan.id, plan.active);
  }

  // ── Subscriptions ──

  listSubscriptions(page = 0, size = 20, status?: string): Promise<PageResult<AdminSubscriptionRow>> {
    return this.repo.adminListSubscriptions(page, size, status);
  }

async downloadExcel(): Promise<void> {
  const blob = await this.repo.exportExcel();
  triggerBlobDownload(blob, `company_subs_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

async downloadPdf(): Promise<void> {
  const blob = await this.repo.exportPdf();
  triggerBlobDownload(blob, `company_subs_${new Date().toISOString().slice(0, 10)}.pdf`);
}
}