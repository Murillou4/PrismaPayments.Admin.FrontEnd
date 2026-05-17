export type AdminUserRole = 'SUPER_ADMIN' | 'ADMIN' | 'SUPPORT' | 'VIEWER';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminUserRole;
  tenantId?: string | null;
  twoFactorEnabled: boolean;
  isActive: boolean;
  lastLoginAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUserCollection {
  items: AdminUser[];
  total: number;
  skip?: number;
  limit?: number;
}

export interface CreateAdminUserPayload {
  name: string;
  email: string;
  password: string;
  role: AdminUserRole;
}

export interface UpdateAdminUserPayload {
  name?: string | null;
  role?: AdminUserRole | null;
  isActive?: boolean | null;
}

export interface ListAdminUsersParams {
  page?: number;
  limit?: number;
}
