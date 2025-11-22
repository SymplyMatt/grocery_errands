import { body, query, param } from 'express-validator';

export const createProductValidator = [
  body('name').notEmpty().withMessage('Product name is required').trim(),
  body('description').notEmpty().withMessage('Product description is required').trim(),
  body('image').notEmpty().withMessage('Product image is required').trim(),
  body('content').notEmpty().withMessage('Product content is required'),
  body('options').isArray({ min: 1 }).withMessage('At least one product option is required'),
  body('options.*.name').notEmpty().withMessage('Option name is required').trim(),
  body('options.*.price').isFloat({ min: 0 }).withMessage('Option price must be a positive number'),
  body('options.*.image').optional().trim(),
  body('options.*.stock').optional().isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  body('categories').optional().isArray().withMessage('Categories must be an array'),
  body('categories.*').optional().isMongoId().withMessage('Invalid category ID in categories array'),
  body('locations').optional().isArray().withMessage('Locations must be an array'),
  body('locations.*').optional().isMongoId().withMessage('Invalid location ID in locations array'),
];

export const getProductByIdValidator = [
  param('id').isMongoId().withMessage('Invalid product ID'),
];

export const addProductOptionValidator = [
  param('productId').isMongoId().withMessage('Invalid product ID'),
  body('name').notEmpty().withMessage('Option name is required').trim(),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('image').optional().trim(),
  body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
];

export const addProductLocationValidator = [
  param('productId').isMongoId().withMessage('Invalid product ID'),
  body('locationId').isMongoId().withMessage('Invalid location ID'),
];

export const addProductCategoryValidator = [
  param('productId').isMongoId().withMessage('Invalid product ID'),
  body('categoryId').isMongoId().withMessage('Invalid category ID'),
];

export const removeProductCategoryValidator = [
  param('productId').isMongoId().withMessage('Invalid product ID'),
  param('categoryId').isMongoId().withMessage('Invalid category ID'),
];

export const updateProductContentValidator = [
  param('productId').isMongoId().withMessage('Invalid product ID'),
  body('content').notEmpty().withMessage('Product content is required'),
];

export const updateProductValidator = [
  param('id').isMongoId().withMessage('Invalid product ID'),
  body('name').optional().trim(),
  body('description').optional().trim(),
  body('image').optional().trim(),
];

export const updateProductOptionValidator = [
  param('productId').isMongoId().withMessage('Invalid product ID'),
  param('optionId').isMongoId().withMessage('Invalid option ID'),
  body('name').optional().trim(),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('image').optional().trim(),
  body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
];

export const deleteProductValidator = [
  param('id').isMongoId().withMessage('Invalid product ID'),
];

export const deleteProductOptionValidator = [
  param('productId').isMongoId().withMessage('Invalid product ID'),
  param('optionId').isMongoId().withMessage('Invalid option ID'),
];

export const getRelatedProductsValidator = [
  param('productId').isMongoId().withMessage('Invalid product ID'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
];

export const getLocationWithProductsValidator = [
  param('locationId').isMongoId().withMessage('Invalid location ID'),
];

