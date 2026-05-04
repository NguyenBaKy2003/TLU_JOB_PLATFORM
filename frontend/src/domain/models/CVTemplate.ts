// ─────────
// Domain Model: CVTemplate
// Maps 1-1 với CVTemplateJpaEntity / CVTemplate.java ở backend
// ─────────

export type TemplateCategory = "professional" | "creative" | "simple";

export interface CVTemplate {
  id: string;
  name: string;
  thumbnailUrl: string | null;
  /** "professional" | "creative" | "simple" */
  category: TemplateCategory | null;
  /** Chỉ dành cho tài khoản premium */
  premium: boolean;
  /** Ứng viên có thể nhìn thấy và chọn */
  active: boolean;
  /** Thymeleaf HTML — chỉ có khi gọi detail */
  htmlContent: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

// ── Value objects dùng khi tạo / cập nhật ─────

export interface CreateTemplateData {
  name: string;
  thumbnailUrl: string;
  category: TemplateCategory;
  premium: boolean;
  /** Nội dung HTML/Thymeleaf đầy đủ */
  htmlContent: string;
}

export interface UpdateTemplateData extends CreateTemplateData {
  active: boolean;
}