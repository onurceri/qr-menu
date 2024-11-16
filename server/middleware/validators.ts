import { body, param } from 'express-validator';

export const restaurantValidators = {
  create: [
    body('name').trim().notEmpty().withMessage('Restaurant name is required')
      .isLength({ max: 100 }).withMessage('Name too long'),
    body('description').optional().isLength({ max: 500 }).withMessage('Description too long'),
  ],
  update: [
    param('restaurantId').notEmpty().withMessage('Restaurant ID is required'),
    body('name').optional().trim().isLength({ max: 100 }).withMessage('Name too long'),
    body('description').optional().isLength({ max: 500 }).withMessage('Description too long'),
    body('sections.*.title').optional().trim().notEmpty().withMessage('Section title is required'),
    body('sections.*.items.*.name').optional().trim().notEmpty().withMessage('Item name is required'),
    body('sections.*.items.*.price').optional().isFloat({ min: 0 }).withMessage('Invalid price'),
  ]
}; 