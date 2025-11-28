import express from 'express';
import { CategoryController } from '../controllers/categories';
import validate from '../middleware/validate';
import * as categoryValidators from '../validators/categories';

const router = express.Router();
const categoryController = new CategoryController();

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Category management and association
 */

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Get all categories
 *     tags: [Categories] 
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         required: true
 *         schema:
 *           type: string
 *         description: The API key for authentication
 *     responses:
 *       200:
 *         description: List of categories
 *       500:
 *         description: Failed to fetch categories
 */
router.get('/', categoryController.getAllCategories);

/**
 * @swagger
 * /categories/withproducts:
 *   get:
 *     summary: Get all categories with their products
 *     tags: [Categories] 
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         required: true
 *         schema:
 *           type: string
 *         description: The API key for authentication
 *     responses:
 *       200:
 *         description: List of categories
 *       500:
 *         description: Failed to fetch categories
 */
router.get('/withproducts', categoryController.getCategoriesWithProducts);

/**
 * @swagger
 * /categories/{id}:
 *   get:
 *     summary: Get a category by ID
 *     tags: [Categories] 
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         required: true
 *         schema:
 *           type: string
 *         description: The API key for authentication
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category retrieved
 *       404:
 *         description: Category not found
 *       500:
 *         description: Error fetching category
 */
router.get('/:id', categoryValidators.getCategoryByIdValidator, validate, categoryController.getCategoryById);

/**
 * @swagger
 * /categories/{categoryId}/products:
 *   get:
 *     summary: Get products under a category
 *     tags: [Categories] 
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         required: true
 *         schema:
 *           type: string
 *         description: The API key for authentication
 *       - name: categoryId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Products in category retrieved
 *       404:
 *         description: Category not found
 *       500:
 *         description: Error fetching products
 */
router.get('/:categoryId/products', categoryValidators.getProductsInCategoryValidator, validate, categoryController.getProductsInCategory);

/**
 * @swagger
 * /locations/{locationId}/categories:
 *   get:
 *     summary: Get categories in a specific location
 *     tags: [Categories] 
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         required: true
 *         schema:
 *           type: string
 *         description: The API key for authentication
 *       - name: locationId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Categories in location retrieved
 *       500:
 *         description: Error fetching categories by location
 */
router.get('/:locationId/categories', categoryValidators.getCategoriesByLocationValidator, validate, categoryController.getCategoriesByLocation);

/**
 * @swagger
 * /categories:
 *   post:
 *     summary: Create a new category
 *     tags: [Categories] 
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         required: true
 *         schema:
 *           type: string
 *         description: The API key for authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *               image:
 *                 type: string
 *               locations:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of category IDs
 *     responses:
 *       201:
 *         description: Category created successfully
 *       500:
 *         description: Error creating category
 */
router.post('/', categoryValidators.createCategoryValidator, validate, categoryController.createCategory);

/**
 * @swagger
 * /categories/locations:
 *   post:
 *     summary: Associate a category with a location
 *     tags: [Categories] 
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         required: true
 *         schema:
 *           type: string
 *         description: The API key for authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [categoryId, locationId]
 *             properties:
 *               categoryId:
 *                 type: string
 *               locationId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Category added to location successfully
 *       404:
 *         description: Category not found
 *       409:
 *         description: Category already associated with location
 *       500:
 *         description: Error associating category
 */
router.post('/locations', categoryValidators.addCategoryToLocationValidator, validate, categoryController.addCategoryToLocation);

/**
 * @swagger
 * /categories/{id}:
 *   put:
 *     summary: Update a category
 *     tags: [Categories] 
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         required: true
 *         schema:
 *           type: string
 *         description: The API key for authentication
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               image:
 *                 type: string
 *               locations:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of location IDs to associate with the category. If provided, replaces all existing location associations.
 *     responses:
 *       200:
 *         description: Category updated successfully
 *       404:
 *         description: Category not found
 *       409:
 *         description: Category with this name already exists
 *       500:
 *         description: Error updating category
 */
router.put('/:id', categoryValidators.updateCategoryValidator, validate, categoryController.updateCategory);

/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     summary: Soft delete a category
 *     tags: [Categories] 
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         required: true
 *         schema:
 *           type: string
 *         description: The API key for authentication
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *       404:
 *         description: Category not found
 *       500:
 *         description: Error deleting category
 */
router.delete('/:id', categoryValidators.deleteCategoryValidator, validate, categoryController.deleteCategory);

/**
 * @swagger
 * /categories/{categoryId}/locations/{locationId}:
 *   delete:
 *     summary: Remove a category-location association
 *     tags: [Categories] 
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         required: true
 *         schema:
 *           type: string
 *         description: The API key for authentication
 *       - name: categoryId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *       - name: locationId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category removed from location
 *       404:
 *         description: Association not found
 *       500:
 *         description: Error removing category from location
 */
router.delete('/:categoryId/locations/:locationId', categoryValidators.removeCategoryFromLocationValidator, validate, categoryController.removeCategoryFromLocation);

export default router;
