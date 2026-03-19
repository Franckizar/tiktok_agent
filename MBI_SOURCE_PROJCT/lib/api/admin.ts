import { api } from './index'

export interface PendingUser {
  id: number
  email: string
  firstname: string
  lastname: string
  role: string
  status: string
}

export interface AdminProfile {
  id: number
  userId: number
  favoriteColor: string
  luckyNumber: number
  isSuperAdmin: boolean
  notes: string
}

export interface PaginatedResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export const adminApi = {
  // Get pending users
  getPendingUsers: (page = 0, size = 100) =>
    api.get<PaginatedResponse<PendingUser>>(`/v1/admin/pending-users?page=${page}&size=${size}`),

  // Get all users
  getAllUsers: (page = 0, size = 100) =>
    api.get<PaginatedResponse<PendingUser>>(`/v1/admin/pending-users?page=${page}&size=${size}`),

  // Get all admin profiles
  getAdminProfiles: () =>
    api.get<AdminProfile[]>(`/v1/admin/all`),

  // Approve user with specific role
  approveUser: (userId: number, role: string) =>
    api.post(`/v1/admin/approve/${userId}/${role}`),
}