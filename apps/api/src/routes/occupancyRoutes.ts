import { Router } from 'express';
import * as occupancyController from '../controllers/occupancyController.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router({ mergeParams: true }); // mergeParams gives access to :apartmentId

router.get('/', asyncHandler(occupancyController.list));
router.post('/', requireAuth, asyncHandler(occupancyController.create));
router.put('/:periodId', requireAuth, asyncHandler(occupancyController.update));
router.delete('/:periodId', requireAuth, asyncHandler(occupancyController.remove));

export default router;
