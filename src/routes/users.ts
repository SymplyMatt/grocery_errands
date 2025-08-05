import express from 'express';
import { UserController } from '../controllers/users';

const router = express.Router();
const userController = new UserController();

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     tags: [users]
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: A list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *       500:
 *         description: Failed to fetch users
 */
router.get('/', userController.getAllUsers);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get location by ID
 *     tags: [users]
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
router.get('/:id', userController.getUserById);

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new location
 *     tags: [users]
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
router.post('/', userController.createUser);

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update a location by ID
 *     tags: [users]
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
router.put('/:id', userController.updateUser);

export default router;
