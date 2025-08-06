import express from 'express';
import { AdminController } from '../controllers/admins';

const router = express.Router();
const adminController = new AdminController();

/**
 * @swagger
 * /admins:
 *   get:
 *     summary: Get all admins
 *     tags: [Admins]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []  # Indicate x-api-key is required in the headers
 *     parameters:
 *       - in: header
 *         name: x-api-key
 *         required: true
 *         schema:
 *           type: string
 *         description: The API key for authentication
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: A list of admins
 */
router.get('/', adminController.getAllAdmins);

/**
 * @swagger
 * /admins/{id}:
 *   get:
 *     summary: Get admin by ID
 *     tags: [Admins]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []  # Indicate x-api-key is required in the headers
 *     parameters:
 *       - in: header
 *         name: x-api-key
 *         required: true
 *         schema:
 *           type: string
 *         description: The API key for authentication
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Admin ID
 *     responses:
 *       200:
 *         description: Admin found
 *       404:
 *         description: Admin not found
 */
router.get('/:id', adminController.getAdminById);

/**
 * @swagger
 * /admins:
 *   post:
 *     summary: Create a new admin
 *     tags: [Admins] 
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []  # Indicate x-api-key is required in the headers
 *     parameters:
 *       - in: header
 *         name: x-api-key
 *         required: true
 *         schema:
 *           type: string
 *         description: The API key for authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *     responses:
 *       201:
 *         description: Admin created successfully
 *       409:
 *         description: Email, username, or phone already exists
 */
router.post('/', adminController.createAdmin);

/**
 * @swagger
 * /admins/{id}:
 *   put:
 *     summary: Update an admin
 *     tags: [Admins] 
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []  # Indicate x-api-key is required in the headers
 *     parameters:
 *       - in: header
 *         name: x-api-key
 *         required: true
 *         schema:
 *           type: string
 *         description: The API key for authentication
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Admin ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *     responses:
 *       200:
 *         description: Admin updated successfully
 *       404:
 *         description: Admin not found
 *       409:
 *         description: Email, username, or phone already exists
 */
router.put('/:id', adminController.updateAdmin);

/**
 * @swagger
 * /admins/{id}/password:
 *   put:
 *     summary: Update admin password
 *     tags: [Admins] 
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []  # Indicate x-api-key is required in the headers
 *     parameters:
 *       - in: header
 *         name: x-api-key
 *         required: true
 *         schema:
 *           type: string
 *         description: The API key for authentication
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Admin ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password updated successfully
 *       401:
 *         description: Current password is incorrect
 *       404:
 *         description: Admin not found
 */
router.put('/:id/password', adminController.updateAdminPassword);

/**
 * @swagger
 * /admins/{id}:
 *   delete:
 *     summary: Soft delete an admin
 *     tags: [Admins] 
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []  # Indicate x-api-key is required in the headers
 *     parameters:
 *       - in: header
 *         name: x-api-key
 *         required: true
 *         schema:
 *           type: string
 *         description: The API key for authentication
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Admin ID
 *     responses:
 *       200:
 *         description: Admin deleted successfully
 *       404:
 *         description: Admin not found
 */
router.delete('/:id', adminController.deleteAdmin);

/**
 * @swagger
 * /admins/login:
 *   post:
 *     summary: Admin login
 *     tags: [Auth] 
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []  # Indicate x-api-key is required in the headers
 *     parameters:
 *       - in: header
 *         name: x-api-key
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
 *             required:
 *               - identifier
 *               - password
 *             properties:
 *               identifier:
 *                 type: string
 *                 description: Email, or phone number
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 accessToken:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       401:
 *         description: Invalid credentials or authentication record not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid credentials
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login failed
 *                 error:
 *                   type: string
 */
router.post('/login', adminController.login);

export default router;
