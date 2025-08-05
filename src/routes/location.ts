import express from 'express';
import { LocationController } from '../controllers/location';

const router = express.Router();
const locationController = new LocationController();

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
 *         description: A list of locations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *       500:
 *         description: Failed to fetch locations
 */
router.get('/', locationController.getAllLocations);

/**
 * @swagger
 * /locations/{id}:
 *   get:
 *     summary: Get location by ID
 *     tags: [Locations]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The location ID
 *     responses:
 *       200:
 *         description: Location found
 *         content:
 *           application/json:
 *       404:
 *         description: Location not found
 *       500:
 *         description: Error fetching location
 */
router.get('/:id', locationController.getLocationById);

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
 *     responses:
 *       201:
 *         description: Location created successfully
 *         content:
 *           application/json:
 *       500:
 *         description: Error creating location
 */
router.post('/', locationController.createLocation);

/**
 * @swagger
 * /locations/{id}:
 *   put:
 *     summary: Update a location by ID
 *     tags: [Locations]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The location ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *     responses:
 *       200:
 *         description: Location updated successfully
 *         content:
 *           application/json:
 *       404:
 *         description: Location not found
 *       500:
 *         description: Error updating location
 */
router.put('/:id', locationController.updateLocation);

export default router;
