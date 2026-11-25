import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/errors.js';
import type { OccupancyPeriodDto } from '@porchlight/shared';

export function mapPeriod(p: {
  id: string;
  apartmentId: string;
  startDate: Date;
  endDate: Date;
  tenantNote: string | null;
  createdAt: Date;
  updatedAt: Date;
}): OccupancyPeriodDto {
  const toDate = (d: Date) => d.toISOString().slice(0, 10);
  return {
    id: p.id,
    apartmentId: p.apartmentId,
    startDate: toDate(p.startDate),
    endDate: toDate(p.endDate),
    tenantNote: p.tenantNote,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  };
}

export async function listPeriods(apartmentId: string): Promise<OccupancyPeriodDto[]> {
  const periods = await prisma.occupancyPeriod.findMany({
    where: { apartmentId },
    orderBy: { startDate: 'asc' },
  });
  return periods.map(mapPeriod);
}

export async function createPeriod(
  apartmentId: string,
  input: { startDate: string; endDate: string; tenantNote?: string | null },
): Promise<OccupancyPeriodDto> {
  const start = new Date(input.startDate);
  const end = new Date(input.endDate);
  if (end < start) throw new AppError(400, 'endDate must be on or after startDate');

  const period = await prisma.occupancyPeriod.create({
    data: { apartmentId, startDate: start, endDate: end, tenantNote: input.tenantNote ?? null },
  });
  return mapPeriod(period);
}

export async function updatePeriod(
  id: string,
  input: { startDate: string; endDate: string; tenantNote?: string | null },
): Promise<OccupancyPeriodDto> {
  const existing = await prisma.occupancyPeriod.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, 'Occupancy period not found');

  const start = new Date(input.startDate);
  const end = new Date(input.endDate);
  if (end < start) throw new AppError(400, 'endDate must be on or after startDate');

  const period = await prisma.occupancyPeriod.update({
    where: { id },
    data: { startDate: start, endDate: end, tenantNote: input.tenantNote ?? null },
  });
  return mapPeriod(period);
}

export async function deletePeriod(id: string): Promise<void> {
  const existing = await prisma.occupancyPeriod.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, 'Occupancy period not found');
  await prisma.occupancyPeriod.delete({ where: { id } });
}

/** Returns true if the apartment has NO occupancy period overlapping [checkIn, checkOut]. */
export function isAvailableForRange(
  periods: { startDate: string; endDate: string }[],
  checkIn: string,
  checkOut: string,
): boolean {
  const ci = new Date(checkIn);
  const co = new Date(checkOut);
  return !periods.some((p) => {
    const ps = new Date(p.startDate);
    const pe = new Date(p.endDate);
    // Overlap: start < other_end AND end > other_start
    return ci < pe && co > ps;
  });
}
