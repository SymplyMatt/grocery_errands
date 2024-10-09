import express from 'express';
import validate from '../middleware/validate';
import { body, query } from 'express-validator';
import { roles } from '../config/utils';
import authenticateToken from '../middleware/authenticateToken';

const router = express.Router();

/**
 * @swagger
 * /users/create/student:
 *   post:
 *     summary: Create a new student
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: John
 *                 description: First name of the student
 *               lastName:
 *                 type: string
 *                 example: Doe
 *                 description: Last name of the student
 *               email:
 *                 type: string
 *                 format: email
 *                 example: student@example.com
 *                 description: Must be a unique and valid email address
 *     responses:
 *       201:
 *         description: Student created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post('/create/student',
    [
        body('firstName').isString().withMessage('First name is required'),
        body('lastName').isString().withMessage('Last name is required'),
        body('email').isEmail().withMessage('Email address is required and must be valid'),
    ],    
    validate
);


export default router;
