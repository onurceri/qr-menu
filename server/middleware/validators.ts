import { body, param } from 'express-validator';

export const restaurantValidators = {
  create: [
    body('name')
      .trim()
      .notEmpty().withMessage('Restaurant name is required')
      .isLength({ max: 100 }).withMessage('Name too long')
      .matches(/^[^<>{}]*$/).withMessage('Invalid characters'),
    body('description')
      .optional()
      .isLength({ max: 500 }).withMessage('Description too long')
      .matches(/^[^<>{}]*$/).withMessage('Invalid characters'),
  ],
  update: [
    param('restaurantId').notEmpty().withMessage('Restaurant ID is required'),
    body('name')
      .optional()
      .trim()
      .isLength({ max: 100 }).withMessage('Name too long')
      .matches(/^[^<>{}]*$/).withMessage('Invalid characters'),
    body('description')
      .optional()
      .isLength({ max: 500 }).withMessage('Description too long')
      .matches(/^[^<>{}]*$/).withMessage('Invalid characters'),
    body('menus.*.language').optional().isLength({ max: 10 }).withMessage('Language code too long'),
    body('menus.*.name').optional().trim().notEmpty().withMessage('Menu name is required'),
    body('menus.*.sections.*.title').optional().trim().notEmpty().withMessage('Section title is required'),
    body('menus.*.sections.*.items.*.name').optional().trim().notEmpty().withMessage('Item name is required'),
    body('menus.*.sections.*.items.*.price').optional().isFloat({ min: 0 }).withMessage('Invalid price'),
    body('openingHours')
      .optional()
      .isString()
      .isLength({ max: 1000 })
      .withMessage('Opening hours must be a string with maximum length of 1000 characters'),
  ]
}; 