import type { AVAILABILITY_STATUSES, INQUIRY_STATUSES } from './constants.js';

export type AvailabilityStatus = (typeof AVAILABILITY_STATUSES)[number];
export type InquiryStatus = (typeof INQUIRY_STATUSES)[number];

export interface AmenityDto {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
}

export interface ApartmentImageDto {
  id: string;
  url: string;
  alt: string | null;
  sortOrder: number;
  isPrimary: boolean;
}

export interface ApartmentListItemDto {
  id: string;
  name: string;
  number: string;
  description: string;
  type: string;
  location: string;
  floor: number | null;
  bedrooms: number;
  bathrooms: number;
  size: number | null;
  price: number;
  availabilityStatus: AvailabilityStatus;
  availableFrom: string | null;
  createdAt: string;
  amenities: AmenityDto[];
  images: ApartmentImageDto[];
}

export interface ApartmentDetailDto extends ApartmentListItemDto {
  createdAt: string;
  updatedAt: string;
}

export interface CustomerDto {
  id: string;
  name: string;
  email: string;
  phone: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InquiryDto {
  id: string;
  subject: string;
  message: string;
  status: InquiryStatus;
  internalNotes: string | null;
  apartmentId: string | null;
  customerId: string;
  createdAt: string;
  updatedAt: string;
  customer?: CustomerDto;
  apartment?: Pick<ApartmentListItemDto, 'id' | 'name' | 'number'> | null;
}

export interface AuthLoginResponse {
  token: string;
  admin: { id: string; email: string; name: string };
}

export interface ApiErrorBody {
  message: string;
  errors?: Record<string, string[]>;
}

export interface DashboardStatsDto {
  totalApartments: number;
  available: number;
  occupied: number;
  upcoming: number;
  comingSoon: number;
  totalCustomers: number;
  activeCustomers: number;
  inProcessCustomers: number;
  pastCustomers: number;
  newInquiries: number;
  inquiriesByStatus: { status: InquiryStatus; count: number }[];
  availabilityDistribution: { status: AvailabilityStatus; count: number }[];
  recentInquiries: {
    id: string;
    subject: string;
    status: InquiryStatus;
    createdAt: string;
    customerName: string;
  }[];
}
