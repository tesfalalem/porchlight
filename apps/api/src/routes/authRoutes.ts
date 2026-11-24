import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';
import {
  loginValidators,
  updateProfileValidators,
  updatePasswordValidators,
} from '../validators/authValidators.js';

const router = Router();

router.post('/login', loginValidators, validateRequest, asyncHandler(authController.login));
router.get('/me', requireAuth, asyncHandler(authController.getProfile));
router.put(
  '/profile',
  requireAuth,
  updateProfileValidators,
  validateRequest,
  asyncHandler(authController.updateProfile),
);
router.put(
  '/password',
  requireAuth,
  updatePasswordValidators,
  validateRequest,
  asyncHandler(authController.updatePassword),
);

export default router;
