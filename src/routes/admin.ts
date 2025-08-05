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
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: A list of Admins
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *       500:
 *         description: Failed to fetch Admins
 */
router.get('/', adminController.getAllAdmins);

/**
 * @swagger
 * /admins/{id}:
 *   get:
 *     summary: Get admins by ID
 *     tags: [Admins]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The admins ID
 *     responses:
 *       200:
 *         description: Admin found
 *         content:
 *           application/json:
 *       404:
 *         description: Admin not found
 *       500:
 *         description: Error fetching admin
 */
router.get('/:id', adminController.getAdminById);

/**
 * @swagger
 * /admins:
 *   post:
 *     summary: Create a new Admin
 *     tags: [Admins]
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *     responses:
 *       201:
 *         description: Admin created successfully
 *         content:
 *           application/json:
 *       500:
 *         description: Error creating Admin
 */
router.post('/', adminController.createAdmin);

/**
 * @swagger
 * /admins/{id}:
 *   put:
 *     summary: Update a Admin by ID
 *     tags: [Admins]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The Admin ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *     responses:
 *       200:
 *         description: Admin updated successfully
 *         content:
 *           application/json:
 *       404:
 *         description: Admin not found
 *       500:
 *         description: Error updating Admin
 */
router.put('/:id', adminController.updateAdmin);

export default router;
