import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/errors.js';
import { mapApartmentDetail, mapApartmentListItem } from '../utils/mappers.js';

const includeRelations = {
  images: true,
  apartmentAmenities: { include: { amenity: true } },
} as const;

export interface ApartmentFilters {
  search?: string;
  type?: string;
  location?: string;
  bedrooms?: number;
  bathrooms?: number;
  minPrice?: number;
  maxPrice?: number;
  availabilityStatus?: string;
  amenityIds?: string[];
  sort?: 'price_asc' | 'price_desc' | 'name_asc' | 'availability';
  includeArchived?: boolean;
}

function buildWhere(filters: ApartmentFilters) {
  const and: Record<string, unknown>[] = [];

  if (!filters.includeArchived) {
    and.push({ isArchived: false });
  }

  if (filters.search) {
    and.push({
      OR: [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { number: { contains: filters.search, mode: 'insensitive' } },
        { location: { contains: filters.search, mode: 'insensitive' } },
      ],
    });
  }
  if (filters.type) and.push({ type: { equals: filters.type, mode: 'insensitive' } });
  if (filters.location) and.push({ location: { contains: filters.location, mode: 'insensitive' } });
  if (filters.bedrooms != null) and.push({ bedrooms: filters.bedrooms });
  if (filters.bathrooms != null) and.push({ bathrooms: filters.bathrooms });
  if (filters.availabilityStatus) {
    if (filters.availabilityStatus === 'Upcoming' || filters.availabilityStatus === 'Coming Soon') {
      and.push({ availabilityStatus: { in: ['Upcoming', 'Coming Soon'] } });
    } else {
      and.push({ availabilityStatus: filters.availabilityStatus });
    }
  }
  if (filters.minPrice != null || filters.maxPrice != null) {
    and.push({
      price: {
        ...(filters.minPrice != null ? { gte: filters.minPrice } : {}),
        ...(filters.maxPrice != null ? { lte: filters.maxPrice } : {}),
      },
    });
  }
  if (filters.amenityIds?.length) {
    and.push({
      AND: filters.amenityIds.map((id) => ({
        apartmentAmenities: { some: { amenityId: id } },
      })),
    });
  }

  return and.length ? { AND: and } : {};
}

function buildOrderBy(sort?: ApartmentFilters['sort']) {
  switch (sort) {
    case 'price_asc':
      return { price: 'asc' as const };
    case 'price_desc':
      return { price: 'desc' as const };
    case 'name_asc':
      return { name: 'asc' as const };
    case 'availability':
      return { availabilityStatus: 'asc' as const };
    default:
      return { createdAt: 'desc' as const };
  }
}

export async function listApartments(filters: ApartmentFilters = {}) {
  const apartments = await prisma.apartment.findMany({
    where: buildWhere(filters),
    include: includeRelations,
    orderBy: filters.sort === 'availability' ? undefined : buildOrderBy(filters.sort),
  });

  if (filters.sort === 'availability') {
    const orderMap: Record<string, number> = {
      Available: 1,
      Upcoming: 2,
      'Coming Soon': 2,
      Occupied: 3,
    };
    apartments.sort((a, b) => {
      const orderA = orderMap[a.availabilityStatus] ?? 99;
      const orderB = orderMap[b.availabilityStatus] ?? 99;
      return orderA - orderB;
    });
  }

  return apartments.map(mapApartmentListItem);
}

export async function getApartmentById(id: string, includeArchived = false) {
  const apartment = await prisma.apartment.findFirst({
    where: { id, ...(includeArchived ? {} : { isArchived: false }) },
    include: includeRelations,
  });
  if (!apartment) throw new AppError(404, 'Apartment not found');
  return mapApartmentDetail(apartment);
}

export interface ApartmentInput {
  name: string;
  number: string;
  description: string;
  type: string;
  location: string;
  floor?: number | null;
  bedrooms: number;
  bathrooms: number;
  size?: number | null;
  price: number;
  availabilityStatus: string;
  availableFrom?: string | null;
  amenityIds?: string[];
  images?: { url: string; alt?: string | null; sortOrder?: number; isPrimary?: boolean }[];
}

async function syncAmenities(apartmentId: string, amenityIds: string[]) {
  await prisma.apartmentAmenity.deleteMany({ where: { apartmentId } });
  if (amenityIds.length) {
    await prisma.apartmentAmenity.createMany({
      data: amenityIds.map((amenityId) => ({ apartmentId, amenityId })),
    });
  }
}

async function syncImages(
  apartmentId: string,
  images: NonNullable<ApartmentInput['images']>,
) {
  await prisma.apartmentImage.deleteMany({ where: { apartmentId } });
  if (images.length) {
    await prisma.apartmentImage.createMany({
      data: images.map((img, index) => ({
        apartmentId,
        url: img.url,
        alt: img.alt ?? null,
        sortOrder: img.sortOrder ?? index,
        isPrimary: img.isPrimary ?? index === 0,
      })),
    });
  }
}

export async function createApartment(input: ApartmentInput) {
  const apartment = await prisma.apartment.create({
    data: {
      name: input.name,
      number: input.number,
      description: input.description,
      type: input.type,
      location: input.location,
      floor: input.floor ?? null,
      bedrooms: input.bedrooms,
      bathrooms: input.bathrooms,
      size: input.size ?? null,
      price: input.price,
      availabilityStatus: input.availabilityStatus,
      availableFrom: input.availableFrom ? new Date(input.availableFrom) : null,
    },
  });

  if (input.amenityIds?.length) await syncAmenities(apartment.id, input.amenityIds);
  if (input.images?.length) await syncImages(apartment.id, input.images);

  return getApartmentById(apartment.id, true);
}

export async function updateApartment(id: string, input: ApartmentInput) {
  const existing = await prisma.apartment.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, 'Apartment not found');

  await prisma.apartment.update({
    where: { id },
    data: {
      name: input.name,
      number: input.number,
      description: input.description,
      type: input.type,
      location: input.location,
      floor: input.floor ?? null,
      bedrooms: input.bedrooms,
      bathrooms: input.bathrooms,
      size: input.size ?? null,
      price: input.price,
      availabilityStatus: input.availabilityStatus,
      availableFrom: input.availableFrom ? new Date(input.availableFrom) : null,
    },
  });

  if (input.amenityIds) await syncAmenities(id, input.amenityIds);
  if (input.images) await syncImages(id, input.images);

  return getApartmentById(id, true);
}

export async function archiveApartment(id: string) {
  const existing = await prisma.apartment.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, 'Apartment not found');
  await prisma.apartment.update({ where: { id }, data: { isArchived: true } });
}

export async function deleteApartment(id: string) {
  const existing = await prisma.apartment.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, 'Apartment not found');
  await prisma.apartment.delete({ where: { id } });
}
