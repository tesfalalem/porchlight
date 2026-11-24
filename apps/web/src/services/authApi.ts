import type {
  AdminProfileDto,
  AuthLoginResponse,
  UpdatePasswordPayload,
  UpdateProfilePayload,
} from '@porchlight/shared';
import { apiClient } from '../lib/apiClient';

export async function loginAdmin(email: string, password: string): Promise<AuthLoginResponse> {
  const { data } = await apiClient.post<AuthLoginResponse>('/auth/login', { email, password });
  return data;
}

export async function fetchAdminProfile(): Promise<AdminProfileDto> {
  const { data } = await apiClient.get<AdminProfileDto>('/auth/me');
  return data;
}

export async function updateAdminProfile(payload: UpdateProfilePayload): Promise<AuthLoginResponse> {
  const { data } = await apiClient.put<AuthLoginResponse>('/auth/profile', payload);
  return data;
}

export async function updateAdminPassword(payload: UpdatePasswordPayload): Promise<{ message: string }> {
  const { data } = await apiClient.put<{ message: string }>('/auth/password', payload);
  return data;
}
