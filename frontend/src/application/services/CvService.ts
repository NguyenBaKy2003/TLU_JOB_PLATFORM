// src/application/services/CvService.ts

import type { ICvRepository } from "@/domain/repositories/ICvRepository";
import type {
  OnlineCV, OnlineCVDetail, CVTemplate, CVSection,
  CreateCVForm, PersonalInfoForm, UpdateCVSectionPayload,
  CVVisibility, SectionType,
  PublicCVDetail,
} from "@/domain/models/Cv";

export class CvService {

  constructor(readonly repo: ICvRepository) {}

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

  createFromForm(form: CreateCVForm): Promise<OnlineCVDetail> {
    return this.repo.create({
      title:      form.title.trim() || "CV của tôi",
      templateId: form.templateId,
    });
  }

  /**
   * Cập nhật personalInfo của CV.
   * Backend yêu cầu PUT phải gửi đủ title + templateId + visibility,
   * nên cần truyền vào `currentCv` để merge các field bắt buộc đó.
   */
  updatePersonalInfo(
    cvId: string,
    form: PersonalInfoForm,
    currentCv: Pick<OnlineCVDetail, "title" | "templateId" | "visibility">,
  ): Promise<OnlineCVDetail> {
    return this.repo.update(cvId, {
      // Giữ nguyên các field bắt buộc từ CV hiện tại
      title:      currentCv.title,
      templateId: currentCv.templateId,
      visibility: currentCv.visibility,
      // Chỉ cập nhật personalInfo
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

  updateTitle(cvId: string, title: string, currentCv: Pick<OnlineCVDetail, "templateId" | "visibility">): Promise<OnlineCVDetail> {
    return this.repo.update(cvId, {
      title:      title.trim(),
      templateId: currentCv.templateId,
      visibility: currentCv.visibility,
    });
  }

  updateVisibility(cvId: string, visibility: CVVisibility, currentCv: Pick<OnlineCVDetail, "title" | "templateId">): Promise<OnlineCVDetail> {
    return this.repo.update(cvId, {
      title:      currentCv.title,
      templateId: currentCv.templateId,
      visibility,
    });
  }

  updateTemplate(cvId: string, templateId: string, currentCv: Pick<OnlineCVDetail, "title" | "visibility">): Promise<OnlineCVDetail> {
    return this.repo.update(cvId, {
      title:      currentCv.title,
      templateId,
      visibility: currentCv.visibility,
    });
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
    exportPdf(cvId: string): Promise<Blob> {
      return this.repo.exportPdf(cvId);
    }
  importFromProfile(cvId: string): Promise<OnlineCVDetail> {
    return this.repo.importFromProfile(cvId);
  }

    // Thêm
    previewHtml(cvId: string): Promise<string> {
      return this.repo.previewHtml(cvId);
    }

    viewPdf(cvId: string): Promise<Blob> {
      return this.repo.viewPdf(cvId);
    }
      getBySlug(slug: string): Promise<PublicCVDetail> {
    return this.repo.getBySlug(slug);
  }

}