import express from 'express';
import { LocationController } from '../controllers/location';

const router = express.Router();
const locationController = new LocationController();

/**
 * @swagger
 * tags:
 *   name: Locations
 *   description: Location management and related operations
 */

 /**
  * @swagger
  * /locations:
  *   get:
  *     summary: Get all locations
  *     tags: [Locations]
  *     security:
  *       - ApiKeyAuth: []
  *     responses:
  *       200:
  *         description: List of all locations
  *       500:
  *         description: Failed to fetch locations
  */
router.get('/', locationController.getAllLocations);

/**
 * @swagger
 * /locations/{id}:
 *   get:
 *     summary: Get a location by ID
 *     tags: [Locations]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Location details
 *       404:
 *         description: Location not found
 *       500:
 *         description: Error fetching location
 */
router.get('/:id', locationController.getLocationById);

/**
 * @swagger
 * /locations/{locationId}/categories:
 *   get:
 *     summary: Get categories associated with a location
 *     tags: [Locations]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - name: locationId
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
 *         description: Categories under location
 *       404:
 *         description: Location not found
 *       500:
 *         description: Error fetching categories
 */
router.get('/:locationId/categories', locationController.getLocationCategories);

/**
 * @swagger
 * /locations/{locationId}/products:
 *   get:
 *     summary: Get products associated with a location
 *     tags: [Locations]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - name: locationId
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
 *       - name: category
 *         in: query
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Products under location
 *       500:
 *         description: Error fetching products
 */
router.get('/:locationId/products', locationController.getLocationProducts);

/**
 * @swagger
 * /locations/{locationId}/stats:
 *   get:
 *     summary: Get location statistics
 *     tags: [Locations]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - name: locationId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Location statistics
 *       404:
 *         description: Location not found
 *       500:
 *         description: Error fetching statistics
 */
router.get('/:locationId/stats', locationController.getLocationStats);

/**
 * @swagger
 * /locations:
 *   post:
 *     summary: Create a new location
 *     tags: [Locations]
 *     security:
 *       - ApiKeyAuth: []
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
 *     responses:
 *       201:
 *         description: Location created successfully
 *       409:
 *         description: Location with this name already exists
 *       500:
 *         description: Error creating location
 */
router.post('/', locationController.createLocation);

/**
 * @swagger
 * /locations/{id}:
 *   put:
 *     summary: Update a location
 *     tags: [Locations]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
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
 *     responses:
 *       200:
 *         description: Location updated successfully
 *       404:
 *         description: Location not found
 *       409:
 *         description: Duplicate name
 *       500:
 *         description: Error updating location
 */
router.put('/:id', locationController.updateLocation);

/**
 * @swagger
 * /locations/{id}:
 *   delete:
 *     summary: Delete a location
 *     tags: [Locations]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Location deleted successfully
 *       400:
 *         description: Location has associated categories
 *       404:
 *         description: Location not found
 *       500:
 *         description: Error deleting location
 */
router.delete('/:id', locationController.deleteLocation);

export default router;
