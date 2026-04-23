
// ─────────────────────────────────────────────────────────────
// Application Service — chứa business rules phía client
// Presentation layer chỉ gọi service, không gọi repo trực tiếp
// ─────────────────────────────────────────────────────────────

import { CVTemplate } from "@/domain/models/Cv";
import { CreateTemplateData, UpdateTemplateData } from "@/domain/models/CVTemplate";
import { IAdminCVTemplateRepository } from "@/domain/repositories/IAdminCVTemplateRepository";

export class AdminCVTemplateService {
  constructor(private readonly repo: IAdminCVTemplateRepository) {}

  // ── Queries ────────────────────────────────────────────────

  listTemplates(): Promise<CVTemplate[]> {
    return this.repo.findAll();
  }

  getTemplate(id: string): Promise<CVTemplate> {
    if (!id?.trim()) throw new Error("Template ID không hợp lệ.");
    return this.repo.findById(id);
  }

  // ── Commands ───────────────────────────────────────────────

  createTemplate(data: CreateTemplateData): Promise<CVTemplate> {
    this.validateCreate(data);
    return this.repo.create(data);
  }

  updateTemplate(id: string, data: UpdateTemplateData): Promise<CVTemplate> {
    if (!id?.trim()) throw new Error("Template ID không hợp lệ.");
    this.validateUpdate(data);
    return this.repo.update(id, data);
  }

  async deleteTemplate(id: string): Promise<void> {
    if (!id?.trim()) throw new Error("Template ID không hợp lệ.");
    await this.repo.remove(id);
  }

  toggleActive(id: string, active: boolean): Promise<CVTemplate> {
    if (!id?.trim()) throw new Error("Template ID không hợp lệ.");
    return this.repo.toggleActive(id, active);
  }

  // ── Validation helpers ─────────────────────────────────────

  private validateCreate(data: CreateTemplateData) {
    if (!data.name?.trim()) throw new Error("Tên template không được để trống.");
    if (data.name.length > 100) throw new Error("Tên template tối đa 100 ký tự.");
    if (!data.htmlContent?.trim()) throw new Error("HTML content không được để trống.");
    if (data.thumbnailUrl && data.thumbnailUrl.length > 500)
      throw new Error("URL thumbnail tối đa 500 ký tự.");
  }

  private validateUpdate(data: UpdateTemplateData) {
    this.validateCreate(data);
    // active field không cần validate thêm vì là boolean
  }
}