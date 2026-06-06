import { triggerBlobDownload } from "@/lib/download";
import type {
  IAdminCandidateSubscriptionRepository,
  AdminCandidateSubscriptionRow, PageResult,
} from "@/domain/repositories/IAdminCandidateSubscriptionRepository";

export class AdminCandidateSubscriptionService {
  constructor(private readonly repo: IAdminCandidateSubscriptionRepository) {}

  listSubscriptions(page = 0, size = 20, status?: string): Promise<PageResult<AdminCandidateSubscriptionRow>> {
    return this.repo.listSubscriptions(page, size, status);
  }

  async downloadExcel(): Promise<void> {
    const blob = await this.repo.exportExcel();
    triggerBlobDownload(blob, `candidate_subs_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }

  async downloadPdf(): Promise<void> {
    const blob = await this.repo.exportPdf();
    triggerBlobDownload(blob, `candidate_subs_${new Date().toISOString().slice(0, 10)}.pdf`);
  }
}