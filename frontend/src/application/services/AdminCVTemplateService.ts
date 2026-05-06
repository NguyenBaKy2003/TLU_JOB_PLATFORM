// application/services/AdminCVTemplateService.ts
import type {
  CVTemplate,
  CreateCVTemplateRequest,
  UpdateCVTemplateRequest,
} from "@/domain/models/AdminTemplates";
import type { IAdminCVTemplateRepository } from "@/domain/repositories/IAdminCVTemplateRepository";
import { TEMPLATE_VALIDATION } from "@/domain/models/AdminTemplates";

// ─────────
// Thumbnail upload constraints — mirror UploadCVTemplateThumbnailUseCase.java
// ─────────
const THUMBNAIL_MAX_SIZE_MB = 5;
const THUMBNAIL_MAX_SIZE_BYTES = THUMBNAIL_MAX_SIZE_MB * 1024 * 1024;
const THUMBNAIL_ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export class AdminCVTemplateService {
  constructor(private readonly repo: IAdminCVTemplateRepository) {}

  async listTemplates(): Promise<CVTemplate[]> {
    return this.repo.findAll();
  }

  async getTemplate(id: string): Promise<CVTemplate> {
    if (!id?.trim()) throw new Error("Template ID không hợp lệ.");
    return this.repo.findById(id);
  }

  async createTemplate(data: CreateCVTemplateRequest): Promise<CVTemplate> {
    this.validateCreate(data);
    return this.repo.create(data);
  }

  async updateTemplate(id: string, data: UpdateCVTemplateRequest): Promise<CVTemplate> {
    if (!id?.trim()) throw new Error("Template ID không hợp lệ.");
    this.validateUpdate(data);
    return this.repo.update(id, data);
  }

  async deleteTemplate(id: string): Promise<void> {
    if (!id?.trim()) throw new Error("Template ID không hợp lệ.");
    await this.repo.remove(id);
  }

  async activateTemplate(id: string): Promise<CVTemplate> {
    if (!id?.trim()) throw new Error("Template ID không hợp lệ.");
    return this.repo.activate(id);
  }

  async deactivateTemplate(id: string): Promise<CVTemplate> {
    if (!id?.trim()) throw new Error("Template ID không hợp lệ.");
    return this.repo.deactivate(id);
  }

  /**
   * Upload / thay ảnh thumbnail cho template.
   * Validate ở client trước khi gửi lên server để UX tốt hơn.
   */
  async uploadThumbnail(id: string, file: File): Promise<CVTemplate> {
    if (!id?.trim()) throw new Error("Template ID không hợp lệ.");
    this.validateThumbnailFile(file);
    return this.repo.uploadThumbnail(id, file);
  }

  // ── Validators ─────────────────────────────────────────────────────────

  private validateCreate(data: CreateCVTemplateRequest) {
    if (!data.name?.trim()) throw new Error("Tên template không được để trống.");
    if (data.name.length > TEMPLATE_VALIDATION.NAME_MAX_LENGTH)
      throw new Error(
        `Tên template tối đa ${TEMPLATE_VALIDATION.NAME_MAX_LENGTH} ký tự.`
      );
    if (!data.htmlContent?.trim()) throw new Error("HTML content không được để trống.");
    if (
      data.thumbnailUrl &&
      data.thumbnailUrl.length > TEMPLATE_VALIDATION.THUMBNAIL_URL_MAX_LENGTH
    )
      throw new Error(
        `URL thumbnail tối đa ${TEMPLATE_VALIDATION.THUMBNAIL_URL_MAX_LENGTH} ký tự.`
      );
  }

  private validateUpdate(data: UpdateCVTemplateRequest) {
    this.validateCreate(data);
  }

  private validateThumbnailFile(file: File) {
    if (!file || file.size === 0)
      throw new Error("File không được để trống.");
    if (file.size > THUMBNAIL_MAX_SIZE_BYTES)
      throw new Error(`Ảnh tối đa ${THUMBNAIL_MAX_SIZE_MB}MB.`);
    if (!THUMBNAIL_ALLOWED_TYPES.includes(file.type))
      throw new Error("Chỉ chấp nhận JPEG, PNG, WEBP.");
  }
}