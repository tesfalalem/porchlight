import type { DashboardStatsDto } from '@porchlight/shared';
import { prisma } from '../config/prisma.js';

export async function getDashboardStats(): Promise<DashboardStatsDto> {
  const [
    totalApartments,
    available,
    occupied,
    upcoming,
    totalCustomers,
    activeCustomers,
    inProcessCustomers,
    pastCustomers,
    newInquiries,
    inquiryGroups,
    availabilityGroups,
    recentInquiryRows,
  ] = await Promise.all([
    prisma.apartment.count({ where: { isArchived: false } }),
    prisma.apartment.count({ where: { isArchived: false, availabilityStatus: 'Available' } }),
    prisma.apartment.count({ where: { isArchived: false, availabilityStatus: 'Occupied' } }),
    prisma.apartment.count({
      where: {
        isArchived: false,
        availabilityStatus: { in: ['Upcoming', 'Coming Soon'] },
      },
    }),
    prisma.customer.count(),
    prisma.customer.count({ where: { notes: { contains: 'active', mode: 'insensitive' } } }),
    prisma.customer.count({ where: { notes: { contains: 'process', mode: 'insensitive' } } }),
    prisma.customer.count({ where: { notes: { contains: 'past', mode: 'insensitive' } } }),
    prisma.inquiry.count({ where: { status: 'New' } }),
    prisma.inquiry.groupBy({ by: ['status'], _count: { status: true } }),
    prisma.apartment.groupBy({
      by: ['availabilityStatus'],
      where: { isArchived: false },
      _count: { availabilityStatus: true },
    }),
    prisma.inquiry.findMany({
      take: 6,
      orderBy: { createdAt: 'desc' },
      include: { customer: { select: { name: true } } },
    }),
  ]);

  const availabilityCounts: Record<string, number> = {};
  for (const g of availabilityGroups) {
    const status = g.availabilityStatus === 'Coming Soon' ? 'Upcoming' : g.availabilityStatus;
    availabilityCounts[status] = (availabilityCounts[status] || 0) + g._count.availabilityStatus;
  }

  return {
    totalApartments,
    available,
    upcoming,
    occupied,
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
    availabilityDistribution: Object.entries(availabilityCounts)
      .map(([status, count]) => ({
        status: status as DashboardStatsDto['availabilityDistribution'][0]['status'],
        count,
      }))
      .sort((a, b) => {
        const order: Record<string, number> = { Available: 1, Upcoming: 2, Occupied: 3 };
        return (order[a.status] ?? 99) - (order[b.status] ?? 99);
      }),
    recentInquiries: recentInquiryRows.map((i) => ({
      id: i.id,
      subject: i.subject,
      status: i.status as DashboardStatsDto['recentInquiries'][0]['status'],
      createdAt: i.createdAt.toISOString(),
      customerName: i.customer.name,
    })),
  };
}
