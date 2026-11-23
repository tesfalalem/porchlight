import type { InquiryDto } from '@porchlight/shared';
import { apiClient } from '../lib/apiClient';

export interface CreateInquiryPayload {
  name: string;
  email: string;
  phone: string;
  apartmentId?: string;
  subject?: string;
  message?: string;
}

export async function createInquiry(payload: CreateInquiryPayload): Promise<InquiryDto> {
  const { data } = await apiClient.post<InquiryDto>('/inquiries', payload);
  return data;
}

export async function fetchInquiries(params?: { status?: string; search?: string }): Promise<InquiryDto[]> {
  const { data } = await apiClient.get<InquiryDto[]>('/inquiries', { params });
  return data;
}

export async function fetchInquiry(id: string): Promise<InquiryDto> {
  const { data } = await apiClient.get<InquiryDto>(`/inquiries/${id}`);
  return data;
}

export async function deleteInquiry(id: string): Promise<void> {
  await apiClient.delete(`/inquiries/${id}`);
}

export async function updateInquiry(
  id: string,
  payload: { status?: string; internalNotes?: string | null },
): Promise<InquiryDto> {
  const { data } = await apiClient.put<InquiryDto>(`/inquiries/${id}`, payload);
  return data;
}
