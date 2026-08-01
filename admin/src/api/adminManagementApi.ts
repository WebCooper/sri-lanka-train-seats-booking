import axiosInstance from './axiosInstance';

export interface AdminUser {
  id: string;
  name: string;
  title?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  email: string;
  nic_number?: string | null;
  mobile_number?: string | null;
  position?: string | null;
  role: string;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface QueryAdminsParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface PaginatedAdminResponse {
  data: AdminUser[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateAdminPayload {
  name: string;
  title?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  nicNumber?: string;
  mobileNumber?: string;
  position?: string;
  password: string;
}

export interface UpdateAdminPayload {
  name?: string;
  title?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  nicNumber?: string;
  mobileNumber?: string;
  position?: string;
  password?: string;
  is_active?: boolean;
}

/**
 * GET /api/v1/admin/admins
 * List system administrators with pagination and search.
 */
export const fetchAdmins = async (params?: QueryAdminsParams): Promise<PaginatedAdminResponse> => {
  const response = await axiosInstance.get<PaginatedAdminResponse>('/api/v1/admin/admins', {
    params,
  });
  return response.data;
};

/**
 * GET /api/v1/admin/admins/:id
 * Retrieve specific administrator details by ID.
 */
export const fetchAdminById = async (id: string): Promise<AdminUser> => {
  const response = await axiosInstance.get<AdminUser>(`/api/v1/admin/admins/${id}`);
  return response.data;
};

/**
 * POST /api/v1/admin/admins
 * Create a new system administrator.
 */
export const createAdminApi = async (payload: CreateAdminPayload): Promise<AdminUser> => {
  const response = await axiosInstance.post<AdminUser>('/api/v1/admin/admins', payload);
  return response.data;
};

/**
 * PUT /api/v1/admin/admins/:id
 * Update administrator details, password, or active status.
 */
export const updateAdminApi = async (id: string, payload: UpdateAdminPayload): Promise<AdminUser> => {
  const response = await axiosInstance.put<AdminUser>(`/api/v1/admin/admins/${id}`, payload);
  return response.data;
};

/**
 * DELETE /api/v1/admin/admins/:id
 * Delete an administrator account.
 */
export const deleteAdminApi = async (id: string): Promise<{ message: string; id: string }> => {
  const response = await axiosInstance.delete<{ message: string; id: string }>(
    `/api/v1/admin/admins/${id}`
  );
  return response.data;
};
