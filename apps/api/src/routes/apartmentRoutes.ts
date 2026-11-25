import { Router } from 'express';
import * as apartmentController from '../controllers/apartmentController.js';
import { requireAuth } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  apartmentIdParam,
  createApartmentValidators,
  updateApartmentValidators,
} from '../validators/apartmentValidators.js';
import occupancyRoutes from './occupancyRoutes.js';

const router = Router();

router.get('/', asyncHandler(apartmentController.list));
router.get('/:id', apartmentIdParam, validateRequest, asyncHandler(apartmentController.getById));
router.post('/', requireAuth, createApartmentValidators, validateRequest, asyncHandler(apartmentController.create));
router.put('/:id', requireAuth, updateApartmentValidators, validateRequest, asyncHandler(apartmentController.update));
router.delete('/:id', requireAuth, apartmentIdParam, validateRequest, asyncHandler(apartmentController.remove));
router.delete('/:id/permanent', requireAuth, apartmentIdParam, validateRequest, asyncHandler(apartmentController.destroy));

// Occupancy periods sub-resource
router.use('/:apartmentId/occupancy', occupancyRoutes);

export default router;
