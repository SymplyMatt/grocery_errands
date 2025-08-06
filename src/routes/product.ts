import express from 'express';
import { ProductController } from '../controllers/product';
import { LocationProductController } from '../controllers/locationProduct';
import authenticateToken from '../middleware/authenticateToken';
import authenticateAdmin from '../middleware/authenticateAdmin';

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
 *                 products:
 *                   type: array
 *       404:
 *         description: Location or products not found
 *       500:
 *         description: Error retrieving location products
 */
router.get('/location/:locationId', locationproductController.getLocationWithProducts);

/**
 * @swagger
 * /products/create:
 *   post:
 *     summary: Create a new product
 *     tags: [Products] 
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
 *               - name
 *               - description
 *               - image
 *               - content
 *               - options
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the product
 *               description:
 *                 type: string
 *                 description: Description of the product
 *               image:
 *                 type: string
 *                 description: Image URL of the product
 *               content:
 *                 type: string
 *                 description: Product content/details
 *               categories:
 *                 type: array
 *                 items:
 *                   type: string
 *               locations:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of category IDs
 *               options:
 *                 type: array
 *                 description: Product options such as price, image, stock
 *                 items:
 *                   type: object
 *                   required:
 *                     - name
 *                     - price
 *                   properties:
 *                     name:
 *                       type: string
 *                     price:
 *                       type: number
 *                     image:
 *                       type: string
 *                     stock:
 *                       type: number
 *     responses:
 *       200:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *       500:
 *         description: Error creating product
 */
router.post('/create',
    authenticateToken,
    authenticateAdmin, 
    productcontroller.createProduct
);

/**
 * @swagger
 * /products/{productId}/options:
 *   post:
 *     summary: Add a product option
 *     tags: [Products] 
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
 *       - name: productId
 *         in: path
 *         required: true
 *         description: ID of the product
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, price]
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               image:
 *                 type: string
 *               stock:
 *                 type: number
 *     responses:
 *       201:
 *         description: Product option added successfully
 *       404:
 *         description: Product not found
 *       500:
 *         description: Error adding product option
 */
router.post('/products/:productId/options',
    authenticateToken,
    authenticateAdmin, 
    productcontroller.addProductOption
);

/**
 * @swagger
 * /products/{productId}/locations:
 *   post:
 *     summary: Add a location to a product
 *     tags: [Products] 
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
 *       - name: productId
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
 *       201:
 *         description: Product location added successfully
 *       404:
 *         description: Product not found
 *       409:
 *         description: Product location already exists
 *       500:
 *         description: Error adding product location
 */
router.post('/products/:productId/locations',
    authenticateToken,
    authenticateAdmin, 
    productcontroller.addProductLocation
);

/**
 * @swagger
 * /products/{productId}/categories:
 *   post:
 *     summary: Add a category to a product
 *     tags: [Products] 
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
 *       - name: productId
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
 *             required: [categoryId]
 *             properties:
 *               categoryId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Product category added successfully
 *       404:
 *         description: Product not found
 *       409:
 *         description: Product category already exists
 *       500:
 *         description: Error adding product category
 */
router.post('/products/:productId/categories',
    authenticateToken,
    authenticateAdmin, 
    productcontroller.addProductCategory
);

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Update product details
 *     tags: [Products] 
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
 *               description:
 *                 type: string
 *               image:
 *                 type: string
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       404:
 *         description: Product not found
 *       500:
 *         description: Error updating product
 */
router.put('/products/:id',
    authenticateToken,
    authenticateAdmin, 
    productcontroller.updateProduct
);

/**
 * @swagger
 * /products/{productId}/content:
 *   put:
 *     summary: Update product content
 *     tags: [Products] 
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
 *       - name: productId
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
 *             required: [content]
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Product content updated successfully
 *       201:
 *         description: Product content created successfully
 *       404:
 *         description: Product not found
 *       500:
 *         description: Error updating product content
 */
router.put('/products/:productId/content',
    authenticateToken,
    authenticateAdmin, 
    productcontroller.updateProductContent
);

/**
 * @swagger
 * /products/{productId}/options/{optionId}:
 *   put:
 *     summary: Update a product option
 *     tags: [Products] 
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
 *       - name: productId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *       - name: optionId
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
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               image:
 *                 type: string
 *               stock:
 *                 type: number
 *     responses:
 *       200:
 *         description: Product option updated successfully
 *       404:
 *         description: Product option not found
 *       500:
 *         description: Error updating product option
 */
router.put('/products/:productId/options/:optionId',
    authenticateToken,
    authenticateAdmin, 
    productcontroller.updateProductOption
);

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Delete a product and all related data
 *     tags: [Products] 
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
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product and related data deleted successfully
 *       404:
 *         description: Product not found
 *       500:
 *         description: Error deleting product
 */
router.delete('/products/:id',
    authenticateToken,
    authenticateAdmin, 
    productcontroller.deleteProduct
);

/**
 * @swagger
 * /products/{productId}/categories/{categoryId}:
 *   delete:
 *     summary: Remove a category from a product
 *     tags: [Products] 
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
 *       - name: productId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *       - name: categoryId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product category removed successfully
 *       404:
 *         description: Product category not found
 *       500:
 *         description: Error removing product category
 */
router.delete('/products/:productId/categories/:categoryId',
    authenticateToken,
    authenticateAdmin, 
    productcontroller.removeProductCategory
);

/**
 * @swagger
 * /products/{productId}/options/{optionId}:
 *   delete:
 *     summary: Delete a product option
 *     tags: [Products] 
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
 *       - name: productId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *       - name: optionId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product option deleted successfully
 *       404:
 *         description: Product option not found
 *       500:
 *         description: Error deleting product option
 */
router.delete('/products/:productId/options/:optionId',
    authenticateToken,
    authenticateAdmin, 
    productcontroller.deleteProductOption
);

export default router;
