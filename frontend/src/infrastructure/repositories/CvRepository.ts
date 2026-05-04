// src/infrastructure/repositories/CvRepository.ts

import type { ICvRepository } from "@/domain/repositories/ICvRepository";
import type {
  OnlineCV, OnlineCVDetail, CVTemplate,
  CreateOnlineCVPayload, UpdateOnlineCVPayload,
  UpdateCVSectionPayload, ReorderSectionsPayload,
  CVSection,
  PublicCVDetail,
} from "@/domain/models/Cv";
import api from "@/lib/axios";

interface ApiResponse<T> { success: boolean; data: T; message?: string; }

export class CvRepository implements ICvRepository {

  private readonly BASE = "/cv";

  // ── Helpers ────────────

  private async get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
    const res = await api.get<ApiResponse<T>>(url, { params });
    return res.data.data;
  }

  private async post<T>(url: string, body?: unknown): Promise<T> {
    const res = await api.post<ApiResponse<T>>(url, body);
    return res.data.data;
  }

  private async put<T>(url: string, body?: unknown): Promise<T> {
    const res = await api.put<ApiResponse<T>>(url, body);
    return res.data.data;
  }

  private async patch<T>(url: string, body?: unknown): Promise<T> {
    const res = await api.patch<ApiResponse<T>>(url, body);
    return res.data.data;
  }

  private async del(url: string): Promise<void> {
    await api.delete(url);
  }

  // ── CRUD CV ───────────

  async listMyCVs(): Promise<OnlineCV[]> {
    return this.get<OnlineCV[]>(this.BASE);
  }

  async create(payload: CreateOnlineCVPayload): Promise<OnlineCVDetail> {
    return this.post<OnlineCVDetail>(this.BASE, payload);
  }

  async getById(cvId: string): Promise<OnlineCVDetail> {
    return this.get<OnlineCVDetail>(`${this.BASE}/${cvId}`);
  }

  async update(cvId: string, payload: UpdateOnlineCVPayload): Promise<OnlineCVDetail> {
    return this.put<OnlineCVDetail>(`${this.BASE}/${cvId}`, payload);
  }

  async delete(cvId: string): Promise<void> {
    return this.del(`${this.BASE}/${cvId}`);
  }

  // ── Sections ──────────

  async addSection(cvId: string, payload: UpdateCVSectionPayload): Promise<CVSection> {
    return this.post<CVSection>(`${this.BASE}/${cvId}/sections`, payload);
  }

  async updateSection(cvId: string, sectionId: string, payload: UpdateCVSectionPayload): Promise<CVSection> {
    return this.put<CVSection>(`${this.BASE}/${cvId}/sections/${sectionId}`, payload);
  }

  async deleteSection(cvId: string, sectionId: string): Promise<void> {
    return this.del(`${this.BASE}/${cvId}/sections/${sectionId}`);
  }

  async reorderSections(cvId: string, payload: ReorderSectionsPayload): Promise<OnlineCVDetail> {
    return this.patch<OnlineCVDetail>(`${this.BASE}/${cvId}/sections/reorder`, payload);
  }

  // ── Lifecycle ─────────

  async publish(cvId: string): Promise<OnlineCVDetail> {
    return this.post<OnlineCVDetail>(`${this.BASE}/${cvId}/publish`);
  }

  async archive(cvId: string): Promise<OnlineCVDetail> {
    return this.post<OnlineCVDetail>(`${this.BASE}/${cvId}/archive`);
  }

  async restore(cvId: string): Promise<OnlineCVDetail> {
    return this.post<OnlineCVDetail>(`${this.BASE}/${cvId}/restore`);
  }

  async duplicate(cvId: string): Promise<OnlineCVDetail> {
    return this.post<OnlineCVDetail>(`${this.BASE}/${cvId}/duplicate`);
  }

// Sửa exportPdf
async exportPdf(cvId: string): Promise<Blob> {
  const res = await api.post(
    `${this.BASE}/${cvId}/export`,
    null,
    { responseType: "blob" }
  );
  return res.data;
}

// Thêm previewHtml
async previewHtml(cvId: string): Promise<string> {
  return this.get<string>(`${this.BASE}/${cvId}/preview-html`);
}

// Thêm viewPdf
async viewPdf(cvId: string): Promise<Blob> {
  const res = await api.get(
    `${this.BASE}/${cvId}/view`,
    { responseType: "blob" }
  );
  return res.data;
}

  async importFromProfile(cvId: string): Promise<OnlineCVDetail> {
    return this.post<OnlineCVDetail>(`${this.BASE}/${cvId}/import-from-profile`);
  }

  // ── Templates ─────────

  async listTemplates(): Promise<CVTemplate[]> {
    return this.get<CVTemplate[]>(`${this.BASE}/templates`);
  }


   async getBySlug(slug: string): Promise<PublicCVDetail> {
    const res = await api.get<ApiResponse<PublicCVDetail>>(`/public/${this.BASE}/${slug}`);
    return res.data.data;
  }
  async getPublicHtml(slug: string): Promise<string> {
    const res = await api.get<{ success: boolean; data: string }>(
      `/public/cv/${slug}/html`
    );
    return res.data.data;
  }


}