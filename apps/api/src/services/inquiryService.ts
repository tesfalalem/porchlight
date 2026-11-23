import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/errors.js';
import { mapInquiry } from '../utils/mappers.js';

export async function createInquiry(input: {
  name: string;
  email: string;
  phone: string;
  apartmentId?: string | null;
  subject?: string | null;
  message?: string | null;
}) {
  if (input.apartmentId) {
    const apt = await prisma.apartment.findFirst({
      where: { id: input.apartmentId, isArchived: false },
    });
    if (!apt) throw new AppError(400, 'Invalid apartment');
  }

  let customer = await prisma.customer.findFirst({
    where: { email: input.email },
  });

  if (!customer) {
    customer = await prisma.customer.create({
      data: {
        name: input.name,
        email: input.email,
        phone: input.phone,
      },
    });
  } else {
    customer = await prisma.customer.update({
      where: { id: customer.id },
      data: { name: input.name, phone: input.phone },
    });
  }

  const fallbackSubject =
    input.subject && input.subject.trim()
      ? input.subject.trim()
      : input.apartmentId
      ? 'Apartment inquiry'
      : 'General Inquiry';
  const fallbackMessage = input.message && input.message.trim() ? input.message.trim() : '';

  const inquiry = await prisma.inquiry.create({
    data: {
      subject: fallbackSubject,
      message: fallbackMessage,
      apartmentId: input.apartmentId ?? null,
      customerId: customer.id,
      status: 'New',
    },
    include: {
      customer: true,
      apartment: { select: { id: true, name: true, number: true } },
    },
  });

  return mapInquiry(inquiry);
}

export async function listInquiries(filters?: { status?: string; search?: string }) {
  const inquiries = await prisma.inquiry.findMany({
    where: {
      ...(filters?.status ? { status: filters.status } : {}),
      ...(filters?.search
        ? {
            OR: [
              { subject: { contains: filters.search, mode: 'insensitive' } },
              { message: { contains: filters.search, mode: 'insensitive' } },
              { customer: { name: { contains: filters.search, mode: 'insensitive' } } },
              { customer: { email: { contains: filters.search, mode: 'insensitive' } } },
            ],
          }
        : {}),
    },
    include: {
      customer: true,
      apartment: { select: { id: true, name: true, number: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  return inquiries.map(mapInquiry);
}

export async function getInquiryById(id: string) {
  const inquiry = await prisma.inquiry.findUnique({
    where: { id },
    include: {
      customer: true,
      apartment: { select: { id: true, name: true, number: true } },
    },
  });
  if (!inquiry) throw new AppError(404, 'Inquiry not found');
  return mapInquiry(inquiry);
}

export async function updateInquiry(
  id: string,
  data: { status?: string; internalNotes?: string | null },
) {
  const existing = await prisma.inquiry.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, 'Inquiry not found');

  const inquiry = await prisma.inquiry.update({
    where: { id },
    data: {
      ...(data.status !== undefined ? { status: data.status } : {}),
      ...(data.internalNotes !== undefined ? { internalNotes: data.internalNotes } : {}),
    },
    include: {
      customer: true,
      apartment: { select: { id: true, name: true, number: true } },
    },
  });

  return mapInquiry(inquiry);
}

export async function deleteInquiry(id: string) {
  const existing = await prisma.inquiry.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, 'Inquiry not found');
  await prisma.inquiry.delete({ where: { id } });
}
