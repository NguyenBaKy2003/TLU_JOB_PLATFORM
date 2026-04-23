import api from "@/lib/axios";
import { getAdminAccessToken } from "@/lib/auth-helpers";
import type { IAdminCVTemplateRepository } from "../../domain/repositories/IAdminCVTemplateRepository";
import type { CVTemplate, CreateTemplateData, UpdateTemplateData } from "../../domain/models/CVTemplate";

// ─────────────────────────────────────────────────────────────
// Infrastructure: HTTP Adapter
// Implements IAdminCVTemplateRepository bằng cách gọi REST API
// ─────────────────────────────────────────────────────────────

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

/** Raw shape trả về từ API — có thể khác domain model */
interface CVTemplateRaw {
  id: string;
  name: string;
  thumbnailUrl?: string | null;
  category?: string | null;
  premium: boolean;
  active: boolean;
  thymeleafTemplate?: string | null; // tên field backend dùng
  htmlContent?: string | null;       // fallback nếu backend đổi tên
  createdAt?: string | null;
  updatedAt?: string | null;
}

/** Map raw API response → domain model */
function toDomain(raw: CVTemplateRaw): CVTemplate {
  return {
    id: raw.id,
    name: raw.name,
    thumbnailUrl: raw.thumbnailUrl ?? null,
    category: (raw.category as CVTemplate["category"]) ?? null,
    premium: raw.premium,
    active: raw.active,
    // backend mapper dùng field "thymeleafTemplate" cho htmlContent
    htmlContent: raw.htmlContent ?? raw.thymeleafTemplate ?? null,
    createdAt: raw.createdAt ?? null,
    updatedAt: raw.updatedAt ?? null,
  };
}

/** Map domain create data → request body backend mong đợi */
function toCreateBody(data: CreateTemplateData) {
  return {
    name: data.name,
    thumbnailUrl: data.thumbnailUrl || null,
    category: data.category,
    premium: data.premium,
    htmlContent: data.htmlContent,
  };
}

/** Map domain update data → request body backend mong đợi */
function toUpdateBody(data: UpdateTemplateData) {
  return {
    ...toCreateBody(data),
    active: data.active,
  };
}

function adminHeaders() {
  const token = getAdminAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export class AdminCVTemplateRepository implements IAdminCVTemplateRepository {
  private readonly BASE = "/admin/cv-templates";

  async findAll(): Promise<CVTemplate[]> {
    const res = await api.get<ApiResponse<CVTemplateRaw[]>>(this.BASE, {
      headers: adminHeaders(),
    });
    return res.data.data.map(toDomain);
  }

  async findById(id: string): Promise<CVTemplate> {
    const res = await api.get<ApiResponse<CVTemplateRaw>>(`${this.BASE}/${id}`, {
      headers: adminHeaders(),
    });
    return toDomain(res.data.data);
  }

  async create(data: CreateTemplateData): Promise<CVTemplate> {
    const res = await api.post<ApiResponse<CVTemplateRaw>>(
      this.BASE,
      toCreateBody(data),
      { headers: adminHeaders() }
    );
    return toDomain(res.data.data);
  }

  async update(id: string, data: UpdateTemplateData): Promise<CVTemplate> {
    const res = await api.put<ApiResponse<CVTemplateRaw>>(
      `${this.BASE}/${id}`,
      toUpdateBody(data),
      { headers: adminHeaders() }
    );
    return toDomain(res.data.data);
  }

  async remove(id: string): Promise<void> {
    await api.delete(`${this.BASE}/${id}`, { headers: adminHeaders() });
  }

  async toggleActive(id: string, active: boolean): Promise<CVTemplate> {
    const res = await api.patch<ApiResponse<CVTemplateRaw>>(
      `${this.BASE}/${id}/activate`,
      { active },
      { headers: adminHeaders() }
    );
    return toDomain(res.data.data);
  }
}