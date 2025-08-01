import express from 'express';
import { ProductController } from '../controllers/product';
import { LocationProductController } from '../controllers/locationProduct';

const router = express.Router();
const productcontroller = new ProductController();
const locationproductController = new LocationProductController();

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for pagination (default is 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of products per page (default is 10)
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: Sort field and order (e.g., createdAt:-1)
 *     responses:
 *       200:
 *         description: A list of products with pagination info
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 products:
 *                   type: array
 *       500:
 *         description: Failed to fetch products
 */
router.get('/', productcontroller.getAllProducts);

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags: [Products]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The product ID
 *     responses:
 *       200:
 *         description: Product found
 *         content:
 *           application/json:
 *       404:
 *         description: Product not found
 *       500:
 *         description: Error fetching product
 */
router.get('/:id', productcontroller.getProductById);

/**
 * @swagger
 * /products/location/{locationId}:
 *   get:
 *     summary: Get all products by location
 *     tags: [Products] 
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: locationId
 *         required: true
 *         schema:
 *           type: string
 *         description: The location ID
 *     responses:
 *       200:
 *         description: Products found for the location
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 location:
 *                   $ref: '#/components/schemas/Location'
 *                 products:
 *                   type: array
 *       404:
 *         description: Location or products not found
 *       500:
 *         description: Error retrieving location products
 */
router.get('/location/:locationId', locationproductController.getLocationWithProducts);

export default router;
