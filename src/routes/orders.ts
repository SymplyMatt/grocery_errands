import express from 'express';
import { ProductController } from '../controllers/product';
import { LocationProductController } from '../controllers/locationProduct';
import authenticateToken from '../middleware/authenticateToken';
import authenticateAdmin from '../middleware/authenticateAdmin';
import { OrderController } from '../controllers/order';
import authenticateUser from '../middleware/authenticateUser';

const router = express.Router();
const ordercontroller = new OrderController();


/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Manage customer orders
 */

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - address
 *               - state
 *               - products
 *             properties:
 *               address:
 *                 type: string
 *               state:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               firstname:
 *                 type: string
 *               lastname:
 *                 type: string
 *               products:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: string
 *                     productOptionId:
 *                       type: string
 *                     quantity:
 *                       type: integer
 *     responses:
 *       201:
 *         description: Order created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Failed to create order
 */
router.post('/',
    authenticateToken,
    authenticateUser,
    ordercontroller.createOrder
);

/**
 * @swagger
 * /orders/user:
 *   get:
 *     summary: Get orders for the authenticated user
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number (default 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page (default 10)
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by order status
 *     responses:
 *       200:
 *         description: Orders retrieved successfully
 *       500:
 *         description: Failed to fetch user orders
 */
router.get('/user',
    authenticateToken,
    authenticateUser,
    ordercontroller.getUserOrders
);

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Get all orders (admin)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *       - in: query
 *         name: firstname
 *         schema:
 *           type: string
 *       - in: query
 *         name: lastname
 *         schema:
 *           type: string
 *       - in: query
 *         name: paymentMethod
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *     responses:
 *       200:
 *         description: Orders retrieved successfully
 *       500:
 *         description: Failed to fetch orders
 */
router.get('/',
    authenticateToken,
    authenticateUser,
    ordercontroller.getOrders
);

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Get a specific order by ID
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order retrieved successfully
 *       404:
 *         description: Order not found
 *       500:
 *         description: Failed to fetch order
 */
router.get('/:id',
    authenticateToken,
    authenticateUser,
    ordercontroller.getOrderById
);

/**
 * @swagger
 * /orders/{id}/status:
 *   patch:
 *     summary: Update the status of an order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED, REFUNDED]
 *     responses:
 *       200:
 *         description: Order status updated successfully
 *       400:
 *         description: Invalid status
 *       404:
 *         description: Order not found
 *       500:
 *         description: Failed to update order status
 */
router.patch('/:id/status',
    authenticateToken, 
    ordercontroller.updateOrderStatus
);

export default router;
