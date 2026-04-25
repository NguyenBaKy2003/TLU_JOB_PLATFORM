// src/domain/repositories/ICvRepository.ts

import type {
  OnlineCV, OnlineCVDetail, CVTemplate,
  CreateOnlineCVPayload, UpdateOnlineCVPayload,
  UpdateCVSectionPayload, ReorderSectionsPayload,
  CVSection,
  PublicCVDetail,
} from "@/domain/models/Cv";

export interface ICvRepository {

  // ── CRUD CV ───────────────────────────────────────────────────────────────

  /** GET /api/v1/cv — Danh sách CV của tôi */
  listMyCVs(): Promise<OnlineCV[]>;

  /** POST /api/v1/cv — Tạo CV mới (DRAFT) */
  create(payload: CreateOnlineCVPayload): Promise<OnlineCVDetail>;

  /** GET /api/v1/cv/:cvId — Chi tiết CV */
  getById(cvId: string): Promise<OnlineCVDetail>;

  /** PUT /api/v1/cv/:cvId — Cập nhật metadata */
  update(cvId: string, payload: UpdateOnlineCVPayload): Promise<OnlineCVDetail>;

  /** DELETE /api/v1/cv/:cvId — Xóa CV */
  delete(cvId: string): Promise<void>;

  // ── Sections ──────────────────────────────────────────────────────────────

  /** POST /api/v1/cv/:cvId/sections — Thêm section mới */
  addSection(cvId: string, payload: UpdateCVSectionPayload): Promise<CVSection>;

  /** PUT /api/v1/cv/:cvId/sections/:sectionId — Cập nhật section */
  updateSection(cvId: string, sectionId: string, payload: UpdateCVSectionPayload): Promise<CVSection>;

  /** DELETE /api/v1/cv/:cvId/sections/:sectionId — Xóa section */
  deleteSection(cvId: string, sectionId: string): Promise<void>;

  /** PATCH /api/v1/cv/:cvId/sections/reorder — Sắp xếp lại sections */
  reorderSections(cvId: string, payload: ReorderSectionsPayload): Promise<OnlineCVDetail>;

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  /** POST /api/v1/cv/:cvId/publish */
  publish(cvId: string): Promise<OnlineCVDetail>;

  /** POST /api/v1/cv/:cvId/archive */
  archive(cvId: string): Promise<OnlineCVDetail>;

  /** POST /api/v1/cv/:cvId/restore */
  restore(cvId: string): Promise<OnlineCVDetail>;

  /** POST /api/v1/cv/:cvId/duplicate */
  duplicate(cvId: string): Promise<OnlineCVDetail>;

  /** POST /api/v1/cv/:cvId/export — Trả về PDF URL */
  exportPdf(cvId: string): Promise<Blob>;

  /** POST /api/v1/cv/:cvId/import-from-profile */
  importFromProfile(cvId: string): Promise<OnlineCVDetail>;

  // ── Templates ─────────────────────────────────────────────────────────────

  /** GET /api/v1/cv/templates — Danh sách template */
  listTemplates(): Promise<CVTemplate[]>;


  /** GET /api/v1/cv/:cvId/preview-html */
  previewHtml(cvId: string): Promise<string>;

  /** GET /api/v1/cv/:cvId/view — stream PDF inline */
  viewPdf(cvId: string): Promise<Blob>;

    /** GET /api/v1/public/cv/:slug */
  getBySlug(slug: string): Promise<PublicCVDetail>;

  getPublicHtml(slug: string): Promise<string>;
}