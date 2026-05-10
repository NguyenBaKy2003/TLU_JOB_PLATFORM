
// ─────────
// Domain Models cho Admin CV Templates
// Mapping từ CVTemplateMapper.java và AdminCVTemplateResponse.java
// ─────────

/**
 * Category của CV Template - khớp với backend enum
 */
export type CVTemplateCategory = 
  | 'PROFESSIONAL' 
  | 'CREATIVE' 
  | 'MODERN' 
  | 'CLASSIC' 
  | 'SIMPLE' 
  | 'OTHER';

/**
 * Domain model cho CV Template (dùng chung cho cả list và detail)
 */
export interface CVTemplate {
  /** UUID của template */
  id: string;
  
  /** Tên hiển thị của template */
  name: string;
  
  /** URL của ảnh thumbnail */
  thumbnailUrl: string | null;
  
  /** Phân loại template */
  category: CVTemplateCategory | null;
  
  /** Template premium chỉ dành cho tài khoản trả phí */
  premium: boolean;
  
  /** Template có đang được active để candidate sử dụng không */
  active: boolean;
  
  /** Nội dung HTML/Thymeleaf của template (chỉ có trong detail endpoint) */
  htmlContent?: string | null;  // Optional vì list không trả về
  
  /** Thời gian tạo */
  createdAt: string | null;
  
  /** Thời gian cập nhật gần nhất */
  updatedAt: string | null;
}

/**
 * Response từ API khi lấy danh sách templates (không có htmlContent)
 */
export type CVTemplateListResponse = Omit<CVTemplate, 'htmlContent'>;

/**
 * Response từ API khi lấy chi tiết template (có htmlContent)
 */
export type CVTemplateDetailResponse = Required<Pick<CVTemplate, 'htmlContent'>> & CVTemplate;

/**
 * DTO cho request tạo template mới
 * Map từ CreateCVTemplateRequest.java
 */
export interface CreateCVTemplateRequest {
  /** Tên template (required, max 255 chars) */
  name: string;
  
  /** URL thumbnail (optional) */
  thumbnailUrl?: string | null;
  
  /** Category của template (optional) */
  category?: CVTemplateCategory | null;
  
  /** Đánh dấu template premium (default: false) */
  premium?: boolean;
  
  /** Nội dung HTML/Thymeleaf (required) */
  htmlContent: string;
}

/**
 * DTO cho request cập nhật template
 * Map từ UpdateCVTemplateRequest.java
 */
export interface UpdateCVTemplateRequest {
  /** Tên template (required, max 255 chars) */
  name: string;
  
  /** URL thumbnail (optional) */
  thumbnailUrl?: string | null;
  
  /** Category của template (optional) */
  category?: CVTemplateCategory | null;
  
  /** Đánh dấu template premium */
  premium?: boolean;
  
  /** Nội dung HTML/Thymeleaf (required) */
  htmlContent: string;
  
  /** Trạng thái active của template */
  active?: boolean;
}

/**
 * Constants cho validation
 */
export const TEMPLATE_VALIDATION = {
  NAME_MAX_LENGTH: 255,
  THUMBNAIL_URL_MAX_LENGTH: 500,
  HTML_CONTENT_MIN_LENGTH: 1,
} as const;

/**
 * Labels cho category (dùng trong UI)
 */
export const TEMPLATE_CATEGORY_LABELS: Record<CVTemplateCategory, string> = {
  PROFESSIONAL: 'Chuyên nghiệp',
  CREATIVE: 'Sáng tạo',
  MODERN: 'Hiện đại',
  CLASSIC: 'Cổ điển',
  SIMPLE: 'Đơn giản',
  OTHER: 'Khác',
};

/**
 * Colors cho category (dùng trong UI)
 */
export const TEMPLATE_CATEGORY_COLORS: Record<CVTemplateCategory, string> = {
  PROFESSIONAL: '#1890ff',
  CREATIVE: '#722ed1',
  MODERN: '#13c2c2',
  CLASSIC: '#fa8c16',
  SIMPLE: '#52c41a',
  OTHER: '#8c8c8c',
};