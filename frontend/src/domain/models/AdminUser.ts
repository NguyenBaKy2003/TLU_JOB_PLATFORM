export type AdminUserRole = "CANDIDATE" | "EMPLOYER" | "ADMIN";

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
  page:          number;   
  size:          number;
  first:         boolean;
  last:          boolean;
  empty:         boolean;
}

export interface AdminUserFilters {
  keyword?: string;
  role?:    AdminUserRole | "";
  active?:  boolean | "";   
  page:     number;
  size:     number;
}