import express from 'express';
import { body, param } from 'express-validator';
import { CartController } from '../controllers/cart';
import authenticateToken from '../middleware/authenticateToken';
import authenticateUser from '../middleware/authenticateUser';

const router = express.Router();
const cartController = new CartController();

/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: Shopping cart management
 */

/**
 * @swagger
 * /cart:
 *   post:
 *     summary: Add item to cart or update quantity
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
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
 *               - productId
 *               - productOptionId
 *             properties:
 *               productId:
 *                 type: string
 *                 description: ID of the product
 *               productOptionId:
 *                 type: string
 *                 description: ID of the product option
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 default: 1
 *                 description: Quantity to add
 *     responses:
 *       201:
 *         description: Item added to cart successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 cartItem:
 *                   type: object
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product or product option not found
 *       500:
 *         description: Internal server error
 */
router.post('/',
  authenticateToken,
  authenticateUser,
  body('productId').notEmpty().withMessage('Product ID is required'),
  body('productOptionId').notEmpty().withMessage('Product Option ID is required'),
  body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  cartController.addToCart
);

/**
 * @swagger
 * /cart:
 *   get:
 *     summary: Get user's cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
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
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Cart retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 cart:
 *                   type: object
 *                   properties:
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                     summary:
 *                       type: object
 *                       properties:
 *                         totalItems:
 *                           type: integer
 *                         totalQuantity:
 *                           type: integer
 *                     pagination:
 *                       type: object
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/',
  authenticateToken,
  authenticateUser,
  cartController.getUserCart
);


/**
 * @swagger
 * /cart/{cartItemId}:
 *   get:
 *     summary: Get cart item by ID
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: header
 *         name: x-api-key
 *         required: true
 *         schema:
 *           type: string
 *         description: The API key for authentication
 *       - in: path
 *         name: cartItemId
 *         required: true
 *         schema:
 *           type: string
 *         description: Cart item ID
 *     responses:
 *       200:
 *         description: Cart item retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Cart item not found
 *       500:
 *         description: Internal server error
 */
router.get('/:cartItemId',
  authenticateToken,
  authenticateUser,
  param('cartItemId').isMongoId().withMessage('Invalid cart item ID'),
  cartController.getCartItem
);

/**
 * @swagger
 * /cart/{cartItemId}:
 *   put:
 *     summary: Update cart item quantity
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: header
 *         name: x-api-key
 *         required: true
 *         schema:
 *           type: string
 *         description: The API key for authentication
 *       - in: path
 *         name: cartItemId
 *         required: true
 *         schema:
 *           type: string
 *         description: Cart item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 description: New quantity for the cart item
 *     responses:
 *       200:
 *         description: Cart item updated successfully
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Cart item not found
 *       500:
 *         description: Internal server error
 */
router.put('/:cartItemId',
  authenticateToken,
  authenticateUser,
  param('cartItemId').isMongoId().withMessage('Invalid cart item ID'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  cartController.updateCartItem
);

/**
 * @swagger
 * /cart/{cartItemId}:
 *   delete:
 *     summary: Remove item from cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: header
 *         name: x-api-key
 *         required: true
 *         schema:
 *           type: string
 *         description: The API key for authentication
 *       - in: path
 *         name: cartItemId
 *         required: true
 *         schema:
 *           type: string
 *         description: Cart item ID
 *     responses:
 *       200:
 *         description: Item removed from cart successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Cart item not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:cartItemId',
  authenticateToken,
  authenticateUser,
  param('cartItemId').isMongoId().withMessage('Invalid cart item ID'),
  cartController.removeFromCart
);

/**
 * @swagger
 * /cart/clear:
 *   delete:
 *     summary: Clear all items from cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: header
 *         name: x-api-key
 *         required: true
 *         schema:
 *           type: string
 *         description: The API key for authentication
 *     responses:
 *       200:
 *         description: Cart cleared successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.delete('/clear',
  authenticateToken,
  authenticateUser,
  cartController.clearCart
);

export default router;