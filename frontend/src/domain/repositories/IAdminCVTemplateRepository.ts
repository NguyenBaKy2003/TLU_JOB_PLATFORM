// domain/repositories/IAdminCVTemplateRepository.ts
import type {
  CVTemplate,
  CreateCVTemplateRequest,
  UpdateCVTemplateRequest,
} from "@/domain/models/AdminTemplates";

// ─────────
// Repository Interface (Port) — domain không phụ thuộc infra
// ─────────

export interface IAdminCVTemplateRepository {
  /** GET /api/v1/admin/cv-templates */
  findAll(): Promise<CVTemplate[]>;

  /** GET /api/v1/admin/cv-templates/:id */
  findById(id: string): Promise<CVTemplate>;

  /** POST /api/v1/admin/cv-templates */
  create(data: CreateCVTemplateRequest): Promise<CVTemplate>;

  /** PUT /api/v1/admin/cv-templates/:id */
  update(id: string, data: UpdateCVTemplateRequest): Promise<CVTemplate>;

  /** DELETE /api/v1/admin/cv-templates/:id */
  remove(id: string): Promise<void>;

  /** PATCH /api/v1/admin/cv-templates/:id/activate */
  activate(id: string): Promise<CVTemplate>;

  /** PATCH /api/v1/admin/cv-templates/:id/deactivate */
  deactivate(id: string): Promise<CVTemplate>;

  /** PATCH /api/v1/admin/cv-templates/:id/thumbnail */
  uploadThumbnail(id: string, file: File): Promise<CVTemplate>;
}