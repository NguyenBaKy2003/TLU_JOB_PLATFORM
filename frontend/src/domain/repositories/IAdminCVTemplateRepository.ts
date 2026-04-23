import type { CVTemplate, CreateTemplateData, UpdateTemplateData } from "../models/CVTemplate";

// ─────────────────────────────────────────────────────────────
// Repository Interface (Port) — domain không phụ thuộc infra
// Adapter thật: AdminCVTemplateRepository (infrastructure)
// ─────────────────────────────────────────────────────────────

export interface IAdminCVTemplateRepository {
  /** GET /api/v1/admin/cv-templates */
  findAll(): Promise<CVTemplate[]>;

  /** GET /api/v1/admin/cv-templates/:id */
  findById(id: string): Promise<CVTemplate>;

  /** POST /api/v1/admin/cv-templates */
  create(data: CreateTemplateData): Promise<CVTemplate>;

  /** PUT /api/v1/admin/cv-templates/:id */
  update(id: string, data: UpdateTemplateData): Promise<CVTemplate>;

  /** DELETE /api/v1/admin/cv-templates/:id */
  remove(id: string): Promise<void>;

  /** PATCH /api/v1/admin/cv-templates/:id/toggle-active */
  toggleActive(id: string, active: boolean): Promise<CVTemplate>;
}