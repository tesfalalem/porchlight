import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/errors.js';
import { mapCustomer } from '../utils/mappers.js';

export async function listCustomers(search?: string) {
  const customers = await prisma.customer.findMany({
    where: search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { phone: { contains: search, mode: 'insensitive' } },
          ],
        }
      : undefined,
    orderBy: { createdAt: 'desc' },
  });
  return customers.map(mapCustomer);
}

export async function getCustomerById(id: string) {
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      inquiries: {
        orderBy: { createdAt: 'desc' },
        include: {
          apartment: { select: { id: true, name: true, number: true } },
        },
      },
    },
  });
  if (!customer) throw new AppError(404, 'Customer not found');
  return customer;
}

export async function createCustomer(
  data: { name: string; email: string; phone: string; notes?: string | null },
) {
  const existing = await prisma.customer.findFirst({ where: { email: data.email } });
  if (existing) throw new AppError(400, 'A customer with this email already exists');
  const customer = await prisma.customer.create({ data });
  return mapCustomer(customer);
}

export async function updateCustomer(
  id: string,
  data: { name: string; email: string; phone: string; notes?: string | null },
) {
  const existing = await prisma.customer.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, 'Customer not found');
  const updated = await prisma.customer.update({ where: { id }, data });
  return mapCustomer(updated);
}

export async function deleteCustomer(id: string) {
  const existing = await prisma.customer.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, 'Customer not found');
  await prisma.customer.delete({ where: { id } });
}
