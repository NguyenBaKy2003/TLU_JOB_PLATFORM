// src/domain/repositories/IAdminCandidateSubscriptionRepository.ts
export interface AdminCandidateSubscriptionRow {
  id:          string;
  candidateId: string;
  candidateName: string;
  planCode:    string;
  status:      "ACTIVE" | "EXPIRED" | "CANCELLED" | "FAILED" | "PENDING";
  startedAt:   string;
  expiresAt:   string;
  amount:      number;
}

export interface PageResult<T> {
  content:       T[];
  totalElements: number;
  totalPages:    number;
}

export interface IAdminCandidateSubscriptionRepository {
  listSubscriptions(page?: number, size?: number, status?: string): Promise<PageResult<AdminCandidateSubscriptionRow>>;
exportExcel(): Promise<Blob>;
exportPdf(): Promise<Blob>;
}