import { Request, Response } from 'express';
import { PopulateOptions } from 'mongoose';
import { Product } from '../models/product/Product';
import { BaseRepository } from '../models/base';
import { IProduct, IProductOption, LocationProduct, ProductCategory, ProductContent, ProductOption } from '../models';

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
      const products = await this.productRepository.find({}, { populate: this.populationOptions});
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
      const existingProduct = await this.productRepository.findOne({ name: { $regex: new RegExp(`^${req.body.name}$`, 'i') }});
      if (existingProduct) {
        res.status(409).json({ message: 'Product with this name already exists' });
        return;
      }
      const productData = { createdBy: "", updatedBy: "", description: req.body.description, name: req.body.name, image: req.body.image };
      const product: IProduct = await this.productRepository.create(productData);
      const productCategories =req.body.categories || [];
      const productContent = req.body.content;
      const productOptions = req.body.options;
      await ProductContent.create({ productId: product._id, content: productContent, createdBy: productData.createdBy });
      const productOptionsDocs = productOptions.map((option: IProductOption) => ({ productId: product._id, name: option.name, price: Number(option.price), image: option.image, stock: option.stock, createdBy: product.createdBy, updatedBy: product.updatedBy }));
      await ProductOption.insertMany(productOptionsDocs);
      const categoryDocs = productCategories.map((categoryId: string) => ({ productId: product._id, categoryId }));
      await ProductCategory.insertMany(categoryDocs);
      const productLocations = req.body.locations || [];
      const locationDocs = productLocations.map((locationId: string) => ({ productId: product._id, locationId }));
      await LocationProduct.insertMany(locationDocs);
      res.status(200).json(product);
    } catch (err) {
      res.status(500).json({ message: 'Error fetching product', error: err });
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
      const { name, description, image } = req.body;
      const updateData: any = { updatedBy: "", updatedAt: new Date()};
      if (name) updateData.name = name;
      if (description) updateData.description = description;
      if (image) updateData.image = image;
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
}