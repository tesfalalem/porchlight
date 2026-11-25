import type { Request, Response } from 'express';
import * as occupancyService from '../services/occupancyService.js';

export async function list(req: Request, res: Response): Promise<void> {
  const data = await occupancyService.listPeriods(req.params.apartmentId);
  res.json(data);
}

export async function create(req: Request, res: Response): Promise<void> {
  const data = await occupancyService.createPeriod(req.params.apartmentId, req.body);
  res.status(201).json(data);
}

export async function update(req: Request, res: Response): Promise<void> {
  const data = await occupancyService.updatePeriod(req.params.periodId, req.body);
  res.json(data);
}

export async function remove(req: Request, res: Response): Promise<void> {
  await occupancyService.deletePeriod(req.params.periodId);
  res.status(204).send();
}
