import type {
  AmenityDto,
  ApartmentDetailDto,
  ApartmentImageDto,
  ApartmentListItemDto,
  AvailabilityStatus,
  CustomerDto,
  InquiryDto,
  InquiryStatus,
  OccupancyPeriodDto,
} from '@porchlight/shared';
import type { Amenity, Apartment, ApartmentImage, Customer, Inquiry, OccupancyPeriod } from '@prisma/client';

type ApartmentWithRelations = Apartment & {
  images: ApartmentImage[];
  apartmentAmenities: { amenity: Amenity }[];
  occupancyPeriods?: OccupancyPeriod[];
};

function mapAmenity(a: Amenity): AmenityDto {
  return {
    id: a.id,
    name: a.name,
    slug: a.slug,
    icon: a.icon,
    description: a.description,
  };
}

function mapImage(img: ApartmentImage): ApartmentImageDto {
  return {
    id: img.id,
    url: img.url,
    alt: img.alt,
    sortOrder: img.sortOrder,
    isPrimary: img.isPrimary,
  };
}

export function mapApartmentListItem(apartment: ApartmentWithRelations): ApartmentListItemDto {
  const toDate = (d: Date) => d.toISOString().slice(0, 10);
  return {
    id: apartment.id,
    name: apartment.name,
    number: apartment.number,
    description: apartment.description,
    type: apartment.type,
    location: apartment.location,
    floor: apartment.floor,
    bedrooms: apartment.bedrooms,
    bathrooms: apartment.bathrooms,
    size: apartment.size,
    price: Number(apartment.price),
    availabilityStatus: apartment.availabilityStatus as AvailabilityStatus,
    availableFrom: apartment.availableFrom ? toDate(apartment.availableFrom) : null,
    createdAt: apartment.createdAt.toISOString(),
    amenities: apartment.apartmentAmenities.map((aa) => mapAmenity(aa.amenity)),
    images: apartment.images
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map(mapImage),
    occupancyPeriods: apartment.occupancyPeriods?.map((p) => ({
      id: p.id,
      apartmentId: p.apartmentId,
      startDate: toDate(p.startDate),
      endDate: toDate(p.endDate),
      tenantNote: p.tenantNote,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    } satisfies OccupancyPeriodDto)),
  };
}

export function mapApartmentDetail(apartment: ApartmentWithRelations): ApartmentDetailDto {
  return {
    ...mapApartmentListItem(apartment),
    createdAt: apartment.createdAt.toISOString(),
    updatedAt: apartment.updatedAt.toISOString(),
  };
}

export function mapCustomer(c: Customer): CustomerDto {
  return {
    id: c.id,
    name: c.name,
    email: c.email,
    phone: c.phone,
    notes: c.notes,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  };
}

type InquiryWithRelations = Inquiry & {
  customer?: Customer | null;
  apartment?: Pick<Apartment, 'id' | 'name' | 'number'> | null;
};

export function mapInquiry(inquiry: InquiryWithRelations): InquiryDto {
  return {
    id: inquiry.id,
    name: inquiry.name || inquiry.customer?.name || '',
    email: inquiry.email || inquiry.customer?.email || '',
    phone: inquiry.phone || inquiry.customer?.phone || '',
    subject: inquiry.subject,
    message: inquiry.message,
    status: inquiry.status as InquiryStatus,
    internalNotes: inquiry.internalNotes,
    apartmentId: inquiry.apartmentId,
    customerId: inquiry.customerId,
    createdAt: inquiry.createdAt.toISOString(),
    updatedAt: inquiry.updatedAt.toISOString(),
    customer: inquiry.customer ? mapCustomer(inquiry.customer) : null,
    apartment: inquiry.apartment
      ? {
          id: inquiry.apartment.id,
          name: inquiry.apartment.name,
          number: inquiry.apartment.number,
        }
      : null,
  };
}
