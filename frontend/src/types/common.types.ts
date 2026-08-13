// frontend/src/types/common.types.ts

export interface PaginationMeta {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
}

export interface PaginationLinks {
  first: string;
  last: string;
  prev: string | null;
  next: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
  links: PaginationLinks;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message: string;
  errors?: Record<string, string[]>;
}

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface User {
  id: number;
  first_name: string;
  role: string;
  role_label: string;
  role_description: string | null;
  last_name: string;
  full_name: string;
  email: string;
  phone?: string;
  avatar?: string;
  department_id?: number;
  is_active: boolean;
  is_approved: boolean;
}

export interface Department {
  id: number;
  name: string;
  code: string;
  description?: string;
  hod_id?: number;
  is_active: boolean;
}

export interface Supplier {
  id: number;
  company_name: string;
  company_email: string;
  company_phone?: string;
  company_registration?: string;
  company_address?: string;
  category: string;
  status: string;
  is_active: boolean;
}

export interface Upload {
  id: number;
  filename: string;
  original_filename: string;
  path: string;
  mime_type: string;
  size: number;
  uploaded_by: number;
  created_at: string;
}
