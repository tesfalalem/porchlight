import { AVAILABILITY_STATUSES } from '@porchlight/shared';
import { body, param } from 'express-validator';

export const apartmentIdParam = [param('id').isString().notEmpty()];

const apartmentBodyFields = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('number').trim().notEmpty().withMessage('Number is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('type').trim().notEmpty().withMessage('Type is required'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('floor').optional({ nullable: true }).isInt({ min: 0 }),
  body('bedrooms').isInt({ min: 0 }).withMessage('Bedrooms must be a non-negative integer'),
  body('bathrooms').isInt({ min: 0 }).withMessage('Bathrooms must be a non-negative integer'),
  body('size').optional({ nullable: true }).isFloat({ min: 0 }),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('availabilityStatus').optional({ nullable: true }).isString(),
  body('availableFrom')
    .optional({ nullable: true })
    .custom((val) => {
      if (!val) return true;
      if (!/^\d{4}-\d{2}-\d{2}/.test(val) && isNaN(Date.parse(val))) {
        throw new Error('Available From must be a valid date');
      }
      return true;
    }),
  body('amenityIds').optional().isArray(),
  body('amenityIds.*').optional().isString(),
  body('images').optional().isArray(),
  body('images.*.url').optional().isString().notEmpty(),
  body('images.*.alt').optional({ nullable: true }).isString(),
  body('images.*.sortOrder').optional().isInt(),
  body('images.*.isPrimary').optional().isBoolean(),
];

export const createApartmentValidators = apartmentBodyFields;
export const updateApartmentValidators = [...apartmentIdParam, ...apartmentBodyFields];
