// src/domain/models/Cv.ts

// ── Enums ─────────────────────────────────────────────────────────────────────

export type CVStatus     = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type CVVisibility = "PUBLIC" | "PRIVATE" | "LINK_ONLY";
export type SectionType  =
  | "SUMMARY" | "EXPERIENCE" | "EDUCATION" | "SKILL"
  | "PROJECT" | "CERTIFICATE" | "LANGUAGE" | "AWARD" | "CUSTOM";

export const CV_STATUS_LABELS: Record<CVStatus, string> = {
  DRAFT:     "Nháp",
  PUBLISHED: "Đã publish",
  ARCHIVED:  "Đã lưu trữ",
};

export const CV_VISIBILITY_LABELS: Record<CVVisibility, string> = {
  PUBLIC:    "Công khai",
  PRIVATE:   "Riêng tư",
  LINK_ONLY: "Chỉ xem qua link",
};

export const SECTION_TYPE_LABELS: Record<SectionType, string> = {
  SUMMARY:     "Giới thiệu",
  EXPERIENCE:  "Kinh nghiệm",
  EDUCATION:   "Học vấn",
  SKILL:       "Kỹ năng",
  PROJECT:     "Dự án",
  CERTIFICATE: "Chứng chỉ",
  LANGUAGE:    "Ngoại ngữ",
  AWARD:       "Giải thưởng",
  CUSTOM:      "Khác",
};

// ── Value objects ─────────────────────────────────────────────────────────────

export interface PersonalInfo {
  fullName:   string | null;
  email:      string | null;
  phone:      string | null;
  address:    string | null;
  avatarUrl:  string | null;
  headline:   string | null;
  linkedIn:   string | null;
  github:     string | null;
  website:    string | null;
}

export interface CVSection {
  id:           string;
  cvId:         string;
  type:         SectionType;
  title:        string;
  content:      string;
  displayOrder: number;
  visible:      boolean;
}

// ── Domain models ─────────────────────────────────────────────────────────────

/** Dùng trong danh sách CV (OnlineCVResponse) */
export interface OnlineCV {
  id:             string;
  title:          string;
  templateId:     string;
  status:         CVStatus;
  visibility:     CVVisibility;
  slug:           string | null;
  viewCount:      number;
  exportedPdfUrl: string | null;
  createdAt:      string;
  updatedAt:      string;
}

/** Dùng trong chi tiết CV (OnlineCVDetailResponse) */
export interface OnlineCVDetail extends OnlineCV {
  personalInfo: PersonalInfo | null;
  sections:     CVSection[];
}

/** Template CV */
export interface CVTemplate {
  id:           string;
  name:         string;
  thumbnailUrl: string | null;
  category:     string | null;
  premium:      boolean;
}

// ── Payloads ──────────────────────────────────────────────────────────────────

export interface CreateOnlineCVPayload {
  title:      string;
  templateId: string;
}

export interface UpdateOnlineCVPayload {
  title?:        string;
  templateId?:   string;
  visibility?:   CVVisibility;
  personalInfo?: Partial<PersonalInfo>;
}

export interface UpdateCVSectionPayload {
  type?:    SectionType;   // chỉ khi thêm mới
  title?:   string;
  content?: string;
  visible?: boolean;
}

export interface ReorderSectionsPayload {
  sectionIds: string[];
}

// ── Form state ────────────────────────────────────────────────────────────────

export interface PersonalInfoForm {
  fullName:  string;
  email:     string;
  phone:     string;
  address:   string;
  avatarUrl: string;
  headline:  string;
  linkedIn:  string;
  github:    string;
  website:   string;
}

export interface CreateCVForm {
  title:      string;
  templateId: string;
}

export const EMPTY_PERSONAL_INFO_FORM: PersonalInfoForm = {
  fullName:  "",
  email:     "",
  phone:     "",
  address:   "",
  avatarUrl: "",
  headline:  "",
  linkedIn:  "",
  github:    "",
  website:   "",
};

export const EMPTY_CREATE_CV_FORM: CreateCVForm = {
  title:      "",
  templateId: "",
};