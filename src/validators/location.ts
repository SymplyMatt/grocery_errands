import { body, query, param } from 'express-validator';

export const createLocationValidator = [
  body('name').notEmpty().withMessage('Location name is required').trim(),
];

export const updateLocationValidator = [
  param('id').isMongoId().withMessage('Invalid location ID'),
  body('name').optional().trim(),
];

export const getLocationByIdValidator = [
  param('id').isMongoId().withMessage('Invalid location ID'),
];

export const getLocationCategoriesValidator = [
  param('locationId').isMongoId().withMessage('Invalid location ID'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
];

export const getLocationProductsValidator = [
  param('locationId').isMongoId().withMessage('Invalid location ID'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('category').optional().trim(),
];

export const getLocationStatsValidator = [
  param('locationId').isMongoId().withMessage('Invalid location ID'),
];

export const deleteLocationValidator = [
  param('id').isMongoId().withMessage('Invalid location ID'),
];

