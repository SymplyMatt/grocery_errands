import { Request, Response } from 'express';
import { PopulateOptions } from 'mongoose';
import { Product } from '../models/product/Product';
import { BaseRepository } from '../models/base';
import { IProduct, IProductOption, LocationProduct, ProductCategory, ProductContent, ProductOption, OrderProduct, Order } from '../models';
import { AuthRequest } from '../middleware/authenticateToken';
import uploadToCloudinary from '../config/uploadImage';

export class ProductController {
  private productRepository: BaseRepository<IProduct>;
  private populationOptions: PopulateOptions[];
  constructor() {
    this.productRepository = new BaseRepository<IProduct>(Product);
    this.populationOptions = [
      { path: 'productOptions' },
      { path: 'productContents' },
      {
        path: 'productCategories',
        populate: { path: 'category' },
      },
      {
        path: 'locationProducts',
        populate: { path: 'location' },
      },
    ];
  }

  public getAllProducts = async (req: Request, res: Response): Promise<void> => {
    try {
      const { page = 1, limit = 10, name, inSeason, categoryId } = req.query;
      let filter: any = { deletedAt: null };
      
      if (name) {
        filter.name = { $regex: name, $options: 'i' };
      }
      
      if (inSeason !== undefined) {
        const inSeasonValue = String(inSeason).toLowerCase();
        filter.inSeason = inSeasonValue === 'true';
      }
      
      if (categoryId) {
        const productCategories = await ProductCategory.find({ categoryId }).select('productId');
        const productIds = productCategories.map(pc => pc.productId);
        if (productIds.length > 0) {
          filter._id = { $in: productIds };
        } else {
          // No products in this category, return empty result
          res.status(200).json({
            results: [],
            pagination: {
              currentPage: Number(page),
              totalPages: 0,
              total: 0,
              hasNext: false,
              hasPrev: false
            }
          });
          return;
        }
      }
      
      const products = await this.productRepository.find(filter, {
        page: Number(page),
        limit: Number(limit),
        populate: this.populationOptions,
        sort: { createdAt: -1 }
      });
      res.status(200).json(products);
    } catch (err) {
      res.status(500).json({ message: 'Failed to fetch products', error: err });
    }
  }; 

  public getProductById = async (req: Request, res: Response): Promise<void> => {
    try {
      const product = await this.productRepository.findById(req.params.id, { populate: this.populationOptions});
      if (!product) {
        res.status(404).json({ message: 'Product not found' });
        return;
      }
      res.status(200).json(product);
    } catch (err) {
      res.status(500).json({ message: 'Error fetching product', error: err });
    }
  };

  public createProduct = async (req: Request, res: Response): Promise<void> => {
    try {
      const authReq = req as AuthRequest;
      const adminId = authReq.user ? authReq.user.toString() : '';
      
      if (!adminId) {
        res.status(401).json({ message: 'Authentication required' });
        return;
      }

      // Check if product with same name already exists
      const existingProduct = await this.productRepository.findOne({ name: { $regex: new RegExp(`^${req.body.name}$`, 'i') }});
      if (existingProduct) {
        res.status(409).json({ message: 'Product with this name already exists' });
        return;
      }
      
      // Get image URL from request body (should be Cloudinary URL)
      const productImageUrl = req.body.image;
      if (!productImageUrl) {
        res.status(400).json({ message: 'Product image is required' });
        return;
      }

      const productOptions = req.body.options || [];
      
      // Check for duplicate option names within the provided options
      const optionNames = productOptions.map((option: IProductOption) => option.name?.toLowerCase().trim());
      const uniqueOptionNames = new Set(optionNames);
      if (optionNames.length !== uniqueOptionNames.size) {
        res.status(400).json({ message: 'Duplicate product option names are not allowed' });
        return;
      }

      // Check if any product option names already exist in the database
      if (productOptions.length > 0) {
        const optionNameQueries = optionNames.map((name: string) => ({ 
          name: { $regex: new RegExp(`^${name}$`, 'i') },
          deletedAt: null 
        }));
        const existingOptions = await ProductOption.find({ $or: optionNameQueries });
        
        if (existingOptions.length > 0) {
          const existingNames = existingOptions.map(opt => opt.name);
          res.status(409).json({ 
            message: 'One or more product options already exist', 
            existingOptions: existingNames 
          });
          return;
        }
      }

      const productData = { 
        createdBy: adminId, 
        updatedBy: adminId, 
        description: req.body.description, 
        name: req.body.name, 
        image: productImageUrl 
      };
      const product: IProduct = await this.productRepository.create(productData);
      const productCategories = req.body.categories || [];
      const productContent = req.body.content;
      
      await ProductContent.create({ productId: product._id, content: productContent, createdBy: adminId });
      
      // Ensure each product option has an image URL
      const productOptionsDocs = productOptions.map((option: IProductOption) => {
        if (!option.image) {
          throw new Error(`Product option "${option.name}" is missing an image URL`);
        }
        return { 
          productId: product._id, 
          name: option.name, 
          price: Number(option.price), 
          image: option.image, 
          stock: option.stock || 0, 
          createdBy: adminId, 
          updatedBy: adminId 
        };
      });
      
      await ProductOption.insertMany(productOptionsDocs);
      const categoryDocs = productCategories.map((categoryId: string) => ({ productId: product._id, categoryId }));
      await ProductCategory.insertMany(categoryDocs);
      const productLocations = req.body.locations || [];
      const locationDocs = productLocations.map((locationId: string) => ({ productId: product._id, locationId }));
      await LocationProduct.insertMany(locationDocs);
      
      // Fetch the complete product with populated fields
      const createdProduct = await this.productRepository.findById(product._id.toString(), { populate: this.populationOptions });
      res.status(201).json(createdProduct);
    } catch (err: any) {
      res.status(500).json({ message: 'Error creating product', error: err.message || err });
    }
  };

  public addProductOption = async (req: Request, res: Response): Promise<void> => {
    try {
      const { productId } = req.params;
      const { name, price, image, stock } = req.body;

      // Verify product exists
      const product = await this.productRepository.findById(productId);
      if (!product) {
        res.status(404).json({ message: 'Product not found' });
        return;
      }

      const productOption = await ProductOption.create({
        productId,
        name,
        price: Number(price),
        image,
        stock,
        createdBy: "", // Set appropriately based on your auth system
        updatedBy: ""
      });

      res.status(201).json({ message: 'Product option added successfully', productOption });
    } catch (err) {
      res.status(500).json({ message: 'Error adding product option', error: err });
    }
  };

  public addProductLocation = async (req: Request, res: Response): Promise<void> => {
    try {
      const { productId } = req.params;
      const { locationId } = req.body;

      // Verify product exists
      const product = await this.productRepository.findById(productId);
      if (!product) {
        res.status(404).json({ message: 'Product not found' });
        return;
      }

      // Check if location already exists for this product
      const existingLocation = await LocationProduct.findOne({ productId, locationId });
      if (existingLocation) {
        res.status(409).json({ message: 'Product location already exists' });
        return;
      }

      const locationProduct = await LocationProduct.create({ productId, locationId });
      res.status(201).json({ message: 'Product location added successfully', locationProduct });
    } catch (err) {
      res.status(500).json({ message: 'Error adding product location', error: err });
    }
  };

  public addProductCategory = async (req: Request, res: Response): Promise<void> => {
    try {
      const { productId } = req.params;
      const { categoryId } = req.body;

      // Verify product exists
      const product = await this.productRepository.findById(productId);
      if (!product) {
        res.status(404).json({ message: 'Product not found' });
        return;
      }

      // Check if category already exists for this product
      const existingCategory = await ProductCategory.findOne({ productId, categoryId });
      if (existingCategory) {
        res.status(409).json({ message: 'Product category already exists' });
        return;
      }

      const productCategory = await ProductCategory.create({ productId, categoryId });
      res.status(201).json({ message: 'Product category added successfully', productCategory });
    } catch (err) {
      res.status(500).json({ message: 'Error adding product category', error: err });
    }
  };

  public removeProductCategory = async (req: Request, res: Response): Promise<void> => {
    try {
      const { productId, categoryId } = req.params;

      const result = await ProductCategory.deleteOne({ productId, categoryId });
      if (result.deletedCount === 0) {
        res.status(404).json({ message: 'Product category not found' });
        return;
      }

      res.status(200).json({ message: 'Product category removed successfully' });
    } catch (err) {
      res.status(500).json({ message: 'Error removing product category', error: err });
    }
  };

  public updateProductContent = async (req: Request, res: Response): Promise<void> => {
    try {
      const { productId } = req.params;
      const { content } = req.body;

      // Verify product exists
      const product = await this.productRepository.findById(productId);
      if (!product) {
        res.status(404).json({ message: 'Product not found' });
        return;
      }

      // Try to update existing content first
      const existingContent = await ProductContent.findOneAndUpdate(
        { productId },
        { 
          content, 
          updatedBy: "", // Set appropriately based on your auth system
          updatedAt: new Date()
        },
        { new: true }
      );

      if (existingContent) {
        res.status(200).json({ message: 'Product content updated successfully', productContent: existingContent });
      } else {
        // Create new content if none exists
        const newContent = await ProductContent.create({
          productId,
          content,
          createdBy: "", // Set appropriately based on your auth system
          updatedBy: ""
        });
        res.status(201).json({ message: 'Product content created successfully', productContent: newContent });
      }
    } catch (err) {
      res.status(500).json({ message: 'Error updating product content', error: err });
    }
  };

  public updateProduct = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { name, description, image, inSeason } = req.body;
      const updateData: any = { updatedBy: "", updatedAt: new Date()};
      if (name) updateData.name = name;
      if (description) updateData.description = description;
      if (image) updateData.image = image;
      if (inSeason !== undefined) updateData.inSeason = inSeason;
      const product = await this.productRepository.updateById(id, updateData, { new: true });
      if (!product) {
        res.status(404).json({ message: 'Product not found' });
        return;
      }
      const updatedProduct = await this.productRepository.findById(id, { populate: this.populationOptions });
      res.status(200).json({ message: 'Product updated successfully', product: updatedProduct });
    } catch (err) {
      res.status(500).json({ message: 'Error updating product', error: err });
    }
  };

  public deleteProduct = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const product = await this.productRepository.findById(id);
      if (!product) {
        res.status(404).json({ message: 'Product not found' });
        return;
      }
      
      // Check if product has any orders
      const productOptions = await ProductOption.find({ productId: id }).select('_id');
      const productOptionIds = productOptions.map(po => po._id);
      const hasOrders = await OrderProduct.exists({ productOptionId: { $in: productOptionIds } });
      
      if (hasOrders) {
        // Mark as unavailable instead of deleting
        await this.productRepository.updateById(id, { inSeason: false, updatedBy: "", updatedAt: new Date() });
        res.status(200).json({ message: 'Product marked as unavailable (has existing orders)' });
        return;
      }
      
      // No orders, safe to delete
      await Promise.all([
        ProductOption.deleteMany({ productId: id }),
        ProductContent.deleteMany({ productId: id }),
        ProductCategory.deleteMany({ productId: id }),
        LocationProduct.deleteMany({ productId: id })
      ]);
      await this.productRepository.deleteById(id);
      res.status(200).json({ message: 'Product and related data deleted successfully' });
    } catch (err) {
      res.status(500).json({ message: 'Error deleting product', error: err });
    }
  };

  public updateProductOption = async (req: Request, res: Response): Promise<void> => {
    try {
      const { productId, optionId } = req.params;
      const { name, price, image, stock } = req.body;
      const updateData: any = { updatedBy: "", updatedAt: new Date() };
      if (name) updateData.name = name;
      if (price !== undefined) updateData.price = Number(price);
      if (image) updateData.image = image;
      if (stock !== undefined) updateData.stock = stock;
      const productOption = await ProductOption.findOneAndUpdate( { _id: optionId, productId }, updateData, { new: true });
      if (!productOption) {
        res.status(404).json({ message: 'Product option not found' });
        return;
      }
      res.status(200).json({ message: 'Product option updated successfully', productOption });
    } catch (err) {
      res.status(500).json({ message: 'Error updating product option', error: err });
    }
  };

  public deleteProductOption = async (req: Request, res: Response): Promise<void> => {
    try {
      const { productId, optionId } = req.params;
      const result = await ProductOption.deleteOne({ _id: optionId, productId });
      if (result.deletedCount === 0) {
        res.status(404).json({ message: 'Product option not found' });
        return;
      }
      res.status(200).json({ message: 'Product option deleted successfully' });
    } catch (err) {
      res.status(500).json({ message: 'Error deleting product option', error: err });
    }
  };

  public getRelatedProducts = async (req: Request, res: Response): Promise<void> => {
    try {
      const { productId } = req.params;
      const { limit = 10 } = req.query;
      const product = await this.productRepository.findById(productId);
      if (!product) {
        res.status(404).json({ message: 'Product not found' });
        return;
      }
      const productCategories = await ProductCategory.find({ productId }).select('categoryId');
      
      if (productCategories.length === 0) {
        res.status(200).json({ message: 'No related products found', relatedProducts: [] });
        return;
      }
      const categoryIds = productCategories.map(pc => pc.categoryId);
      const relatedProductCategories = await ProductCategory.find({
        categoryId: { $in: categoryIds },
        productId: { $ne: productId }
      }).select('productId');
      if (relatedProductCategories.length === 0) {
        res.status(200).json({ message: 'No related products found', relatedProducts: [] });
        return;
      }
      const relatedProductIds = [...new Set(relatedProductCategories.map(rpc => rpc.productId))];
      const relatedProducts = await this.productRepository.find(
        { _id: { $in: relatedProductIds.slice(0, Number(limit)) } },
        { populate: this.populationOptions }
      );
      res.status(200).json({
        message: 'Related products retrieved successfully',
        products: relatedProducts
      });
    } catch (err) {
      res.status(500).json({ message: 'Error fetching related products', error: err });
    }
  };

  public getTopSellingProducts = async (req: Request, res: Response): Promise<void> => {
    try {
      const { limit = 10 } = req.query;
      
      // Get all delivered/paid orders to count sales
      const completedOrderStatuses = ['DELIVERED', 'PAID'];
      const completedOrders = await Order.find({ 
        status: { $in: completedOrderStatuses } 
      }).select('_id');
      const completedOrderIds = completedOrders.map(order => order._id);

      // Aggregate order products to get total quantity sold per product
      const topSellingAggregation = await OrderProduct.aggregate([
        {
          $match: {
            orderId: { $in: completedOrderIds }
          }
        },
        {
          $group: {
            _id: '$productId',
            totalQuantity: { $sum: '$quantity' },
            totalRevenue: { $sum: { $multiply: ['$quantity', '$price'] } }
          }
        },
        {
          $sort: { totalQuantity: -1 }
        },
        {
          $limit: Number(limit)
        }
      ]);

      if (topSellingAggregation.length === 0) {
        res.status(200).json({
          results: [],
          pagination: {
            currentPage: 1,
            totalPages: 0,
            total: 0,
            hasNext: false,
            hasPrev: false
          }
        });
        return;
      }

      // Get product IDs from aggregation
      const productIds = topSellingAggregation.map(item => item._id);
      
      // Fetch full product details
      const productsResult = await this.productRepository.find(
        { 
          _id: { $in: productIds },
          deletedAt: null
        },
        { populate: this.populationOptions }
      );

      const products = productsResult.results || [];

      // Sort products by the order from aggregation (maintain top selling order)
      const productMap = new Map(products.map((p: IProduct) => [p._id.toString(), p]));
      const sortedProducts = productIds
        .map(id => productMap.get(id.toString()))
        .filter((p): p is IProduct => p !== undefined);

      res.status(200).json({
        results: sortedProducts,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          total: sortedProducts.length,
          hasNext: false,
          hasPrev: false
        }
      });
    } catch (err) {
      res.status(500).json({ message: 'Error fetching top selling products', error: err });
    }
  };

  public searchProducts = async (req: Request, res: Response): Promise<void> => {
    try {
      const { q, page = 1, limit = 10 } = req.query;
      
      if (!q || typeof q !== 'string' || q.trim().length === 0) {
        res.status(400).json({ message: 'Search query is required' });
        return;
      }

      const searchQuery = q.trim();
      const searchRegex = { $regex: searchQuery, $options: 'i' };

      // Search in product name, description, and product option names
      const productOptions = await ProductOption.find({
        name: searchRegex,
        deletedAt: null
      }).select('productId');
      
      const productIdsFromOptions = [...new Set(productOptions.map(po => po.productId.toString()))];

      // Build filter to search in multiple fields
      const filter: any = {
        deletedAt: null,
        $or: [
          { name: searchRegex },
          { description: searchRegex },
          ...(productIdsFromOptions.length > 0 ? [{ _id: { $in: productIdsFromOptions } }] : [])
        ]
      };

      const products = await this.productRepository.find(filter, {
        page: Number(page),
        limit: Number(limit),
        populate: this.populationOptions,
        sort: { createdAt: -1 }
      });

      res.status(200).json(products);
    } catch (err) {
      res.status(500).json({ message: 'Error searching products', error: err });
    }
  };

  public getPopularSearches = async (req: Request, res: Response): Promise<void> => {
    try {
      const { limit = 5 } = req.query;
      
      // Get top selling products and extract their names as popular searches
      const completedOrderStatuses = ['DELIVERED', 'CONFIRMED', 'PROCESSING', 'SHIPPED'];
      const completedOrders = await Order.find({ 
        status: { $in: completedOrderStatuses } 
      }).select('_id');
      const completedOrderIds = completedOrders.map(order => order._id);

      const topSellingAggregation = await OrderProduct.aggregate([
        {
          $match: {
            orderId: { $in: completedOrderIds }
          }
        },
        {
          $group: {
            _id: '$productId',
            totalQuantity: { $sum: '$quantity' }
          }
        },
        {
          $sort: { totalQuantity: -1 }
        },
        {
          $limit: Number(limit)
        }
      ]);

      if (topSellingAggregation.length === 0) {
        res.status(200).json({ results: [] });
        return;
      }

      const productIds = topSellingAggregation.map(item => item._id);
      const products = await this.productRepository.find(
        { 
          _id: { $in: productIds },
          deletedAt: null
        },
        { populate: this.populationOptions }
      );

      // Extract product names as popular searches
      const popularSearches = (products.results || []).map((p: IProduct) => p.name);

      res.status(200).json({ results: popularSearches });
    } catch (err) {
      res.status(500).json({ message: 'Error fetching popular searches', error: err });
    }
  };

  public uploadImage = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ message: 'No image file provided' });
        return;
      }

      const imageUrl = await uploadToCloudinary({
        file: req.file,
        folder: 'products',
        resourceType: 'image'
      });

      res.status(200).json({ 
        message: 'Image uploaded successfully',
        url: imageUrl 
      });
    } catch (err: any) {
      res.status(500).json({ 
        message: 'Error uploading image', 
        error: err.message || err 
      });
    }
  };
}