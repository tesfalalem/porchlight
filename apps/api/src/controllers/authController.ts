import type { Request, Response } from 'express';
import * as authService from '../services/authService.js';

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body as { email: string; password: string };
  const result = await authService.loginAdmin(email, password);
  res.json(result);
}

export async function getProfile(req: Request, res: Response): Promise<void> {
  const adminId = req.admin!.adminId;
  const profile = await authService.getAdminProfile(adminId);
  res.json(profile);
}

export async function updateProfile(req: Request, res: Response): Promise<void> {
  const adminId = req.admin!.adminId;
  const { name, email } = req.body as { name?: string; email?: string };
  const result = await authService.updateAdminProfile(adminId, { name, email });
  res.json(result);
}

export async function updatePassword(req: Request, res: Response): Promise<void> {
  const adminId = req.admin!.adminId;
  const { currentPassword, newPassword } = req.body as {
    currentPassword: string;
    newPassword: string;
  };
  const result = await authService.updateAdminPassword(adminId, currentPassword, newPassword);
  res.json(result);
}
