import express from 'express';
import { UserController } from '../controllers/users';
import validate from '../middleware/validate';
import * as userValidators from '../validators/users';

const router = express.Router();
const userController = new UserController();



/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
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
 *             properties:
 *               firstname:
 *                 type: string
 *                 example: John
 *               lastname:
 *                 type: string
 *                 example: Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: johndoe@example.com
 *               phone:
 *                 type: string
 *                 example: "+2348012345678"
 *               whatsapp:
 *                 type: string
 *                 example: "+2348098765432"
 *               locationId:
 *                 type: string
 *                 example: "64c9f12a8a9b9a001f3a1234"
 *               username:
 *                 type: string
 *                 example: johndoe
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "Password123!!!"
 *             required:
 *               - firstname
 *               - lastname
 *               - email
 *               - phone
 *               - username
 *               - password
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal Server Error
 */
router.post('/', userValidators.createUserValidator, validate, userController.createUser);

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update a user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         required: true
 *         schema:
 *           type: string
 *         description: The API key for authentication
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal Server Error
 */
router.put('/:id', userValidators.updateUserValidator, validate, userController.updateUser);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete a user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         required: true
 *         schema:
 *           type: string
 *         description: The API key for authentication
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal Server Error
 */
router.delete('/:id', userValidators.deleteUserValidator, validate, userController.deleteUser);

/**
 * @swagger
 * /users/location/{locationId}:
 *   get:
 *     summary: Get users by location
 *     tags: [Users] 
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
 *         description: List of users by location
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Location not found
 *       500:
 *         description: Error fetching users
 */
router.get('/location/:locationId', userValidators.getUsersByLocationValidator, validate, userController.getUsersByLocation);

/**
 * @swagger
 * /users/search:
 *   get:
 *     summary: Search users
 *     tags: [Auth] 
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         required: true
 *         schema:
 *           type: string
 *         description: The API key for authentication
 *       - name: q
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *       - name: locationId
 *         in: query
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
 *         description: Search results
 *       400:
 *         description: Search query is required
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Error searching users
 */
router.get('/search', userValidators.searchUsersValidator, validate, userController.searchUsers);

/**
 * @swagger
 * /users/profile/{id}:
 *   get:
 *     summary: Get user profile
 *     tags: [Auth] 
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
 *         description: User profile retrieved
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 *       500:
 *         description: Error fetching user profile
 */
router.get('/profile/:id', userValidators.getUserProfileValidator, validate, userController.getUserProfile);

/**
 * @swagger
 * /users/{userId}/location:
 *   put:
 *     summary: Update user location
 *     tags: [Users] 
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         required: true
 *         schema:
 *           type: string
 *         description: The API key for authentication
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [locationId]
 *             properties:
 *               locationId:
 *                 type: string
 *     responses:
 *       200:
 *         description: User location updated
 *       400:
 *         description: Invalid location ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 *       500:
 *         description: Error updating user location
 */
router.put('/:userId/location', userValidators.updateUserLocationValidator, validate, userController.updateUserLocation);

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: User login
 *     tags: [Auth]
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
 *                 description: Email, username, or phone number
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
router.post('/login', userValidators.loginValidator, validate, userController.login);

/**
 * @swagger
 * /users/verify:
 *   post:
 *     summary: Verify a user's account with a verification code
 *     tags: [Users]
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
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "68b45662e5bf6e27781e63d0"
 *               code:
 *                 type: string
 *                 example: "123456"
 *             required:
 *               - userId
 *               - code
 *     responses:
 *       200:
 *         description: User verified successfully
 *       400:
 *         description: Invalid request or verification code
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal Server Error
 */
router.post('/verify', userValidators.verifyUserValidator, validate, userController.verifyUser);

/**
 * @swagger
 * /users/resend-verification:
 *   post:
 *     summary: Resend a verification code to the user
 *     tags: [Users]
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
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "68b45662e5bf6e27781e63d0"
 *             required:
 *               - userId
 *     responses:
 *       200:
 *         description: Verification code resent successfully
 *       400:
 *         description: Invalid request (missing userId or already verified)
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal Server Error
 */
router.post('/resend-verification', userValidators.resendVerificationCodeValidator, validate, userController.resendVerificationCode);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get a user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         required: true
 *         schema:
 *           type: string
 *         description: The API key for authentication
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal Server Error
 */
router.get('/:id', userValidators.getUserByIdValidator, validate, userController.getUserById);


/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
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
 *         description: A list of users
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal Server Error
 */
router.get('/', userValidators.getAllUsersValidator, validate, userController.getAllUsers);

export default router;