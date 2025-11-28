import express from 'express';
import { ProductController } from '../controllers/product';
import { LocationProductController } from '../controllers/locationProduct';
import authenticateToken from '../middleware/authenticateToken';
import authenticateAdmin from '../middleware/authenticateAdmin';
import validate from '../middleware/validate';
import * as productValidators from '../validators/product';
import upload from '../config/multer';

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
 *     parameters:
 *       - in: header
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
 * /products/top-selling:
 *   get:
 *     summary: Get top selling products
 *     tags: [Products] 
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         required: true
 *         schema:
 *           type: string
 *         description: The API key for authentication
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of top selling products to return (default is 10)
 *     responses:
 *       200:
 *         description: Top selling products retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     type: object
 *                 pagination:
 *                   type: object
 *       500:
 *         description: Error fetching top selling products
 */
router.get('/top-selling', productcontroller.getTopSellingProducts);

/**
 * @swagger
 * /products/search:
 *   get:
 *     summary: Search products
 *     tags: [Products] 
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         required: true
 *         schema:
 *           type: string
 *         description: The API key for authentication
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query string
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
 *     responses:
 *       200:
 *         description: Search results with pagination
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     type: object
 *                 pagination:
 *                   type: object
 *       400:
 *         description: Invalid search query
 *       500:
 *         description: Error searching products
 */
router.get('/search', productValidators.searchProductsValidator, validate, productcontroller.searchProducts);

/**
 * @swagger
 * /products/popular-searches:
 *   get:
 *     summary: Get popular search terms
 *     tags: [Products] 
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         required: true
 *         schema:
 *           type: string
 *         description: The API key for authentication
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of popular searches to return (default is 5, max 20)
 *     responses:
 *       200:
 *         description: Popular search terms retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     type: string
 *       500:
 *         description: Error fetching popular searches
 */
router.get('/popular-searches', productValidators.getPopularSearchesValidator, validate, productcontroller.getPopularSearches);

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags: [Products] 
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
router.get('/:id', productValidators.getProductByIdValidator, validate, productcontroller.getProductById);

/**
 * @swagger
 * /products/{productId}/related:
 *   get:
 *     summary: Get related products by product ID
 *     description: Retrieves products that share categories with the specified product
 *     tags: [Products] 
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         required: true
 *         schema:
 *           type: string
 *         description: The API key for authentication
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: The product ID to find related products for
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 5
 *         description: Maximum number of related products to return
 *     responses:
 *       200:
 *         description: Related products retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Related products retrieved successfully"
 *                 totalFound:
 *                   type: integer
 *                   description: Total number of related products found
 *                   example: 12
 *                 returned:
 *                   type: integer
 *                   description: Number of products returned in this response
 *                   example: 5
 *                 relatedProducts:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "507f1f77bcf86cd799439011"
 *                       name:
 *                         type: string
 *                         example: "Related Product Name"
 *                       description:
 *                         type: string
 *                         example: "Product description"
 *                       image:
 *                         type: string
 *                         example: "https://example.com/image.jpg"
 *                       productOptions:
 *                         type: array
 *                         items:
 *                           type: object
 *                       productContents:
 *                         type: array
 *                         items:
 *                           type: object
 *                       productCategories:
 *                         type: array
 *                         items:
 *                           type: object
 *                       locationProducts:
 *                         type: array
 *                         items:
 *                           type: object
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Product not found"
 *       500:
 *         description: Error fetching related products
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error fetching related products"
 *                 error:
 *                   type: object
 *                   description: Detailed error information
 */
router.get('/:productId/related', productValidators.getRelatedProductsValidator, validate, productcontroller.getRelatedProducts);

/**
 * @swagger
 * /products/location/{locationId}:
 *   get:
 *     summary: Get all products by location
 *     tags: [Products]  
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
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
router.get('/location/:locationId', productValidators.getLocationWithProductsValidator, validate, locationproductController.getLocationWithProducts);

/**
 * @swagger
 * /products/upload-image:
 *   post:
 *     summary: Upload an image to Cloudinary
 *     tags: [Products] 
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Image file to upload (jpg, jpeg, png, webp)
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Image uploaded successfully"
 *                 url:
 *                   type: string
 *                   example: "https://res.cloudinary.com/..."
 *       400:
 *         description: No image file provided
 *       500:
 *         description: Error uploading image
 */
router.post('/upload-image',
    authenticateToken,
    authenticateAdmin,
    upload.single('image'),
    productcontroller.uploadImage
);

/**
 * @swagger
 * /products/create:
 *   post:
 *     summary: Create a new product
 *     tags: [Products] 
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
 *                 description: Image URL of the product (from upload-image endpoint)
 *               content:
 *                 type: string
 *                 description: Product content/details
 *               categories:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of category IDs
 *               locations:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of location IDs
 *               options:
 *                 type: array
 *                 description: Product options such as price, image, stock
 *                 items:
 *                   type: object
 *                   required:
 *                     - name
 *                     - price
 *                     - image
 *                   properties:
 *                     name:
 *                       type: string
 *                     price:
 *                       type: number
 *                     image:
 *                       type: string
 *                       description: Image URL for the option (from upload-image endpoint)
 *                     stock:
 *                       type: number
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   description: The created product object
 *       500:
 *         description: Error creating product
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
router.post('/create',
    authenticateToken,
    authenticateAdmin,
    productValidators.createProductValidator,
    validate,
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
 *     parameters:
 *       - in: header
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
router.post('/:productId/options',
    authenticateToken,
    authenticateAdmin,
    productValidators.addProductOptionValidator,
    validate,
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
 *     parameters:
 *       - in: header
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
router.post('/:productId/locations',
    authenticateToken,
    authenticateAdmin,
    productValidators.addProductLocationValidator,
    validate,
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
 *     parameters:
 *       - in: header
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
router.post('/:productId/categories',
    authenticateToken,
    authenticateAdmin,
    productValidators.addProductCategoryValidator,
    validate,
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
router.put('/:id',
    authenticateToken,
    authenticateAdmin,
    productValidators.updateProductValidator,
    validate,
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
 *     parameters:
 *       - in: header
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
router.put('/:productId/content',
    authenticateToken,
    authenticateAdmin,
    productValidators.updateProductContentValidator,
    validate,
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
 *     parameters:
 *       - in: header
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
router.put('/:productId/options/:optionId',
    authenticateToken,
    authenticateAdmin,
    productValidators.updateProductOptionValidator,
    validate,
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
 *         description: Product and related data deleted successfully
 *       404:
 *         description: Product not found
 *       500:
 *         description: Error deleting product
 */
router.delete('/:id',
    authenticateToken,
    authenticateAdmin,
    productValidators.deleteProductValidator,
    validate,
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
 *     parameters:
 *       - in: header
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
router.delete('/:productId/categories/:categoryId',
    authenticateToken,
    authenticateAdmin,
    productValidators.removeProductCategoryValidator,
    validate,
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
 *     parameters:
 *       - in: header
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
router.delete('/:productId/options/:optionId',
    authenticateToken,
    authenticateAdmin,
    productValidators.deleteProductOptionValidator,
    validate,
    productcontroller.deleteProductOption
);

export default router;
