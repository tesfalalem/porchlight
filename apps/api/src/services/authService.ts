import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { AuthLoginResponse } from '@porchlight/shared';
import { prisma } from '../config/prisma.js';
import { env } from '../config/env.js';
import { AppError } from '../utils/errors.js';

export async function loginAdmin(email: string, password: string): Promise<AuthLoginResponse> {
  const admin = await prisma.adminUser.findUnique({ where: { email } });
  if (!admin) {
    throw new AppError(401, 'Invalid email or password');
  }

  const valid = await bcrypt.compare(password, admin.passwordHash);
  if (!valid) {
    throw new AppError(401, 'Invalid email or password');
  }

  const token = jwt.sign(
    { adminId: admin.id, email: admin.email },
    env.jwtSecret,
    { expiresIn: '8h' },
  );

  return {
    token,
    admin: { id: admin.id, email: admin.email, name: admin.name },
  };
}

export async function getAdminProfile(adminId: string) {
  const admin = await prisma.adminUser.findUnique({
    where: { id: adminId },
    select: { id: true, name: true, email: true, createdAt: true, updatedAt: true },
  });
  if (!admin) {
    throw new AppError(404, 'Admin not found');
  }
  return {
    ...admin,
    createdAt: admin.createdAt.toISOString(),
    updatedAt: admin.updatedAt.toISOString(),
  };
}

export async function updateAdminProfile(
  adminId: string,
  data: { name?: string; email?: string },
): Promise<AuthLoginResponse> {
  const admin = await prisma.adminUser.findUnique({ where: { id: adminId } });
  if (!admin) {
    throw new AppError(404, 'Admin not found');
  }

  const newEmail = data.email?.trim().toLowerCase();
  const newName = data.name?.trim();

  if (newEmail && newEmail !== admin.email.toLowerCase()) {
    const existing = await prisma.adminUser.findUnique({ where: { email: newEmail } });
    if (existing && existing.id !== adminId) {
      throw new AppError(409, 'Email address is already in use by another account');
    }
  }

  const updated = await prisma.adminUser.update({
    where: { id: adminId },
    data: {
      ...(newName ? { name: newName } : {}),
      ...(newEmail ? { email: newEmail } : {}),
    },
    select: { id: true, name: true, email: true },
  });

  const token = jwt.sign(
    { adminId: updated.id, email: updated.email },
    env.jwtSecret,
    { expiresIn: '8h' },
  );

  return {
    token,
    admin: { id: updated.id, email: updated.email, name: updated.name },
  };
}

export async function updateAdminPassword(
  adminId: string,
  currentPassword: string,
  newPassword: string,
): Promise<{ message: string }> {
  const admin = await prisma.adminUser.findUnique({ where: { id: adminId } });
  if (!admin) {
    throw new AppError(404, 'Admin not found');
  }

  const valid = await bcrypt.compare(currentPassword, admin.passwordHash);
  if (!valid) {
    throw new AppError(400, 'Current password is incorrect');
  }

  if (!newPassword || newPassword.length < 8) {
    throw new AppError(400, 'New password must be at least 8 characters long');
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.adminUser.update({
    where: { id: adminId },
    data: { passwordHash },
  });

  return { message: 'Password updated successfully' };
}
