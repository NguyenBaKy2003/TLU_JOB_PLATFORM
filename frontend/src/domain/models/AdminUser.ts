export type AdminUserRole   = "CANDIDATE" | "EMPLOYER" | "ADMIN" | "SUPER_ADMIN";

export interface AdminUser {
  id:          string;
  email:       string;
  fullName:    string;
  role:        AdminUserRole;
  active:      boolean;
  createdAt:   string;
  lastLoginAt: string | null;
}

export interface AdminUserPage {
  content:       AdminUser[];
  totalElements: number;
  totalPages:    number;
  number:        number;
  size:          number;
}

export interface AdminUserFilters {
  keyword?: string;
  role?:    AdminUserRole | "";
  page:     number;
  size:     number;
}