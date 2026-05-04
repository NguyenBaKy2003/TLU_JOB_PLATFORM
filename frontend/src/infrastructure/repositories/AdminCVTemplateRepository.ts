// infrastructure/repositories/AdminCVTemplateRepository.ts
import api from "@/lib/axios";
import { getAdminAccessToken } from "@/lib/auth-helpers";
import type { IAdminCVTemplateRepository } from "../../domain/repositories/IAdminCVTemplateRepository";
import type { 
  CVTemplate, 
  CVTemplateListResponse, 
  CVTemplateDetailResponse,
  CreateCVTemplateRequest, 
  UpdateCVTemplateRequest 
} from "@/domain/models/AdminTemplates";

// ─────────
// Infrastructure: HTTP Adapter
// ─────────

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

function adminHeaders() {
  const token = getAdminAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export class AdminCVTemplateRepository implements IAdminCVTemplateRepository {
  private readonly BASE = "/admin/cv-templates";

  async findAll(): Promise<CVTemplate[]> {
    const res = await api.get<ApiResponse<CVTemplateListResponse[]>>(this.BASE, {
      headers: adminHeaders(),
    });
    // CVTemplateListResponse[] is assignable to CVTemplate[] vì htmlContent là optional
    return res.data.data;
  }

  async findById(id: string): Promise<CVTemplate> {
    const res = await api.get<ApiResponse<CVTemplateDetailResponse>>(`${this.BASE}/${id}`, {
      headers: adminHeaders(),
    });
    // CVTemplateDetailResponse extends CVTemplate nên assignable
    return res.data.data;
  }

  async create(data: CreateCVTemplateRequest): Promise<CVTemplate> {
    const res = await api.post<ApiResponse<CVTemplateDetailResponse>>(
      this.BASE,
      data,
      { headers: adminHeaders() }
    );
    return res.data.data;
  }

  async update(id: string, data: UpdateCVTemplateRequest): Promise<CVTemplate> {
    const res = await api.put<ApiResponse<CVTemplateDetailResponse>>(
      `${this.BASE}/${id}`,
      data,
      { headers: adminHeaders() }
    );
    return res.data.data;
  }

  async remove(id: string): Promise<void> {
    await api.delete(`${this.BASE}/${id}`, { headers: adminHeaders() });
  }

  async activate(id: string): Promise<CVTemplate> {
    const res = await api.patch<ApiResponse<CVTemplateListResponse>>(
      `${this.BASE}/${id}/activate`,
      {},
      { headers: adminHeaders() }
    );
    return res.data.data;
  }

  async deactivate(id: string): Promise<CVTemplate> {
    const res = await api.patch<ApiResponse<CVTemplateListResponse>>(
      `${this.BASE}/${id}/deactivate`,
      {},
      { headers: adminHeaders() }
    );
    return res.data.data;
  }
}