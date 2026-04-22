// src/application/services/CvService.ts

import type { ICvRepository } from "@/domain/repositories/ICvRepository";
import type {
  OnlineCV, OnlineCVDetail, CVTemplate, CVSection,
  CreateCVForm, PersonalInfoForm, UpdateCVSectionPayload,
  CVVisibility, SectionType,
} from "@/domain/models/Cv";

export class CvService {

  constructor(private readonly repo: ICvRepository) {}

  // ── Queries ───────────────────────────────────────────────────────────────

  listMyCVs(): Promise<OnlineCV[]> {
    return this.repo.listMyCVs();
  }

  getById(cvId: string): Promise<OnlineCVDetail> {
    return this.repo.getById(cvId);
  }

  listTemplates(): Promise<CVTemplate[]> {
    return this.repo.listTemplates();
  }

  // ── CV CRUD ───────────────────────────────────────────────────────────────

  /**
   * Tạo CV mới từ form.
   * title rỗng → dùng tên template làm tiêu đề mặc định.
   */
  createFromForm(form: CreateCVForm): Promise<OnlineCVDetail> {
    return this.repo.create({
      title:      form.title.trim() || "CV của tôi",
      templateId: form.templateId,
    });
  }

  /**
   * Cập nhật metadata CV: title, template, visibility, personalInfo.
   */
  updatePersonalInfo(cvId: string, form: PersonalInfoForm): Promise<OnlineCVDetail> {
    return this.repo.update(cvId, {
      personalInfo: {
        fullName:  form.fullName  || null,
        email:     form.email     || null,
        phone:     form.phone     || null,
        address:   form.address   || null,
        avatarUrl: form.avatarUrl || null,
        headline:  form.headline  || null,
        linkedIn:  form.linkedIn  || null,
        github:    form.github    || null,
        website:   form.website   || null,
      },
    });
  }

  updateTitle(cvId: string, title: string): Promise<OnlineCVDetail> {
    return this.repo.update(cvId, { title: title.trim() });
  }

  updateVisibility(cvId: string, visibility: CVVisibility): Promise<OnlineCVDetail> {
    return this.repo.update(cvId, { visibility });
  }

  updateTemplate(cvId: string, templateId: string): Promise<OnlineCVDetail> {
    return this.repo.update(cvId, { templateId });
  }

  delete(cvId: string): Promise<void> {
    return this.repo.delete(cvId);
  }

  // ── Sections ──────────────────────────────────────────────────────────────

  addSection(cvId: string, type: SectionType, title: string): Promise<CVSection> {
    const payload: UpdateCVSectionPayload = { type, title, content: "", visible: true };
    return this.repo.addSection(cvId, payload);
  }

  updateSection(cvId: string, sectionId: string, payload: UpdateCVSectionPayload): Promise<CVSection> {
    return this.repo.updateSection(cvId, sectionId, payload);
  }

  deleteSection(cvId: string, sectionId: string): Promise<void> {
    return this.repo.deleteSection(cvId, sectionId);
  }

  reorderSections(cvId: string, sectionIds: string[]): Promise<OnlineCVDetail> {
    return this.repo.reorderSections(cvId, { sectionIds });
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  publish(cvId: string): Promise<OnlineCVDetail> {
    return this.repo.publish(cvId);
  }

  archive(cvId: string): Promise<OnlineCVDetail> {
    return this.repo.archive(cvId);
  }

  restore(cvId: string): Promise<OnlineCVDetail> {
    return this.repo.restore(cvId);
  }

  duplicate(cvId: string): Promise<OnlineCVDetail> {
    return this.repo.duplicate(cvId);
  }

  exportPdf(cvId: string): Promise<string> {
    return this.repo.exportPdf(cvId);
  }

  importFromProfile(cvId: string): Promise<OnlineCVDetail> {
    return this.repo.importFromProfile(cvId);
  }
}