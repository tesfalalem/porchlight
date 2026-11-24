import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/errors.js';
import { mapInquiry } from '../utils/mappers.js';

export async function createInquiry(input: {
  name: string;
  email?: string | null;
  phone?: string | null;
  apartmentId?: string | null;
  subject?: string | null;
  message?: string | null;
}) {
  const cleanEmail = (input.email || '').trim();
  const cleanPhone = (input.phone || '').trim();

  if (!cleanEmail && !cleanPhone) {
    throw new AppError(400, 'Please provide at least an email address or a phone number');
  }

  if (input.apartmentId) {
    const apt = await prisma.apartment.findFirst({
      where: { id: input.apartmentId, isArchived: false },
    });
    if (!apt) throw new AppError(400, 'Invalid apartment');
  }

  const fallbackSubject =
    input.subject && input.subject.trim()
      ? input.subject.trim()
      : input.apartmentId
      ? 'Apartment inquiry'
      : 'General Inquiry';
  const fallbackMessage = input.message && input.message.trim() ? input.message.trim() : '';

  // Save submission only in Inquiries. Do not create customer records.
  const inquiry = await prisma.inquiry.create({
    data: {
      name: input.name.trim(),
      email: cleanEmail,
      phone: cleanPhone,
      subject: fallbackSubject,
      message: fallbackMessage,
      apartmentId: input.apartmentId ?? null,
      status: 'New',
    },
    include: {
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
              { name: { contains: filters.search, mode: 'insensitive' } },
              { email: { contains: filters.search, mode: 'insensitive' } },
              { phone: { contains: filters.search, mode: 'insensitive' } },
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
