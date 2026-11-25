import type { DashboardStatsDto } from '@porchlight/shared';
import { prisma } from '../config/prisma.js';

export async function getDashboardStats(): Promise<DashboardStatsDto> {
  const now = new Date();

  const [
    totalApartments,
    available,
    upcoming,
    totalCustomers,
    activeCustomers,
    inProcessCustomers,
    pastCustomers,
    newInquiries,
    inquiryGroups,
    recentInquiryRows,
  ] = await Promise.all([
    prisma.apartment.count({ where: { isArchived: false } }),
    prisma.apartment.count({ where: { isArchived: false, availableFrom: { lte: now } } }),
    prisma.apartment.count({ where: { isArchived: false, availableFrom: { gt: now } } }),
    prisma.customer.count(),
    prisma.customer.count({ where: { notes: { contains: 'active', mode: 'insensitive' } } }),
    prisma.customer.count({ where: { notes: { contains: 'process', mode: 'insensitive' } } }),
    prisma.customer.count({ where: { notes: { contains: 'past', mode: 'insensitive' } } }),
    prisma.inquiry.count({ where: { status: 'New' } }),
    prisma.inquiry.groupBy({ by: ['status'], _count: { status: true } }),
    prisma.inquiry.findMany({
      take: 6,
      orderBy: { createdAt: 'desc' },
      include: { customer: { select: { name: true } } },
    }),
  ]);

  return {
    totalApartments,
    available,
    upcoming,
    occupied: 0,
    comingSoon: upcoming,
    totalCustomers,
    activeCustomers,
    inProcessCustomers,
    pastCustomers,
    newInquiries,
    inquiriesByStatus: inquiryGroups.map((g) => ({
      status: g.status as DashboardStatsDto['inquiriesByStatus'][0]['status'],
      count: g._count.status,
    })),
    availabilityDistribution: [
      { status: 'Available Now', count: available },
      { status: 'Future Move-In', count: upcoming },
    ],
    recentInquiries: recentInquiryRows.map((i) => ({
      id: i.id,
      subject: i.subject,
      status: i.status as DashboardStatsDto['recentInquiries'][0]['status'],
      createdAt: i.createdAt.toISOString(),
      customerName: i.name || i.customer?.name || 'Inquirer',
    })),
  };
}
