import { INQUIRY_STATUSES } from '@porchlight/shared';
import { body, param } from 'express-validator';

export const inquiryIdParam = [param('id').isString().notEmpty()];

export const createInquiryValidators = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email')
    .optional({ values: 'falsy' })
    .trim()
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),
  body('phone')
    .optional({ values: 'falsy' })
    .trim(),
  body().custom((_, { req }) => {
    const email = typeof req.body?.email === 'string' ? req.body.email.trim() : '';
    const phone = typeof req.body?.phone === 'string' ? req.body.phone.trim() : '';
    if (!email && !phone) {
      throw new Error('Please provide at least an email address or a phone number');
    }
    return true;
  }),
  body('apartmentId').optional({ nullable: true }).isString(),
  body('subject').optional({ nullable: true }).isString(),
  body('message').optional({ nullable: true }).isString(),
];

export const updateInquiryValidators = [
  ...inquiryIdParam,
  body('status')
    .optional()
    .isIn([...INQUIRY_STATUSES])
    .withMessage('Invalid inquiry status'),
  body('internalNotes').optional({ nullable: true }).isString(),
];
