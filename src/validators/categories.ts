import { body, query, param } from 'express-validator';

export const createCategoryValidator = [
  body('name').notEmpty().withMessage('Category name is required').trim(),
  body('image').optional().trim(),
  body('locations').optional().isArray().withMessage('Locations must be an array'),
  body('locations.*').optional().isMongoId().withMessage('Invalid location ID in locations array'),
];

export const updateCategoryValidator = [
  param('id').isMongoId().withMessage('Invalid category ID'),
  body('name').optional().trim(),
  body('image').optional().trim(),
  body('locations').optional().isArray().withMessage('Locations must be an array'),
  body('locations.*').optional().isMongoId().withMessage('Invalid location ID in locations array'),
];

export const getCategoryByIdValidator = [
  param('id').isMongoId().withMessage('Invalid category ID'),
];

export const getProductsInCategoryValidator = [
  param('categoryId').isMongoId().withMessage('Invalid category ID'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
];

export const addCategoryToLocationValidator = [
  body('categoryId').isMongoId().withMessage('Invalid category ID'),
  body('locationId').isMongoId().withMessage('Invalid location ID'),
];

export const removeCategoryFromLocationValidator = [
  param('categoryId').isMongoId().withMessage('Invalid category ID'),
  param('locationId').isMongoId().withMessage('Invalid location ID'),
];

export const getCategoriesByLocationValidator = [
  param('locationId').isMongoId().withMessage('Invalid location ID'),
];

export const deleteCategoryValidator = [
  param('id').isMongoId().withMessage('Invalid category ID'),
];

