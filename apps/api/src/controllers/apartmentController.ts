import type { Request, Response } from 'express';
import * as apartmentService from '../services/apartmentService.js';

function parseFilters(req: Request): apartmentService.ApartmentFilters {
  const q = req.query;
  const amenityIds = typeof q.amenityIds === 'string' ? q.amenityIds.split(',').filter(Boolean) : undefined;
  return {
    search: typeof q.search === 'string' ? q.search : undefined,
    type: typeof q.type === 'string' ? q.type : undefined,
    location: typeof q.location === 'string' ? q.location : undefined,
    bedrooms: q.bedrooms != null ? Number(q.bedrooms) : undefined,
    bathrooms: q.bathrooms != null ? Number(q.bathrooms) : undefined,
    minPrice: q.minPrice != null ? Number(q.minPrice) : undefined,
    maxPrice: q.maxPrice != null ? Number(q.maxPrice) : undefined,
    availabilityStatus: typeof q.availabilityStatus === 'string' ? q.availabilityStatus : undefined,
    amenityIds,
    sort: typeof q.sort === 'string' ? (q.sort as apartmentService.ApartmentFilters['sort']) : undefined,
    includeArchived: q.includeArchived === 'true',
    checkIn: typeof q.checkIn === 'string' ? q.checkIn : undefined,
    checkOut: typeof q.checkOut === 'string' ? q.checkOut : undefined,
  };
}

export async function list(req: Request, res: Response): Promise<void> {
  const data = await apartmentService.listApartments(parseFilters(req));
  res.json(data);
}

export async function getById(req: Request, res: Response): Promise<void> {
  const data = await apartmentService.getApartmentById(req.params.id);
  res.json(data);
}

export async function create(req: Request, res: Response): Promise<void> {
  const data = await apartmentService.createApartment(req.body);
  res.status(201).json(data);
}

export async function update(req: Request, res: Response): Promise<void> {
  const data = await apartmentService.updateApartment(req.params.id, req.body);
  res.json(data);
}

export async function remove(req: Request, res: Response): Promise<void> {
  await apartmentService.archiveApartment(req.params.id);
  res.status(204).send();
}

export async function destroy(req: Request, res: Response): Promise<void> {
  await apartmentService.deleteApartment(req.params.id);
  res.status(204).send();
}
