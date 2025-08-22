import { Request, Response } from 'express';
import { BaseRepository } from '../models/base';
import { Category, ICategory, Product, IProduct, ProductCategory, LocationCategory } from '../models';

export class CategoryController {
    private categoryRepository: BaseRepository<ICategory>;
    private productRepository: BaseRepository<IProduct>;
    constructor() {
        this.categoryRepository = new BaseRepository<ICategory>(Category);
        this.productRepository = new BaseRepository<IProduct>(Product);
    }

    public getAllCategories = async (req: Request, res: Response): Promise<void> => {
        try {
            const categories = await this.categoryRepository.find({}, { limit: 1000 });
            res.status(200).json(categories);
        } catch (err) {
            res.status(500).json({ message: 'Failed to fetch categories', error: err });
        }
    };

    public getCategoriesWithProducts = async (req: Request, res: Response): Promise<void> => {
        try {
            const categories = await this.categoryRepository.find({}, { populate: [ { path:'productCategories', populate: {path: "product", populate: "productOptions"} } ] });
            res.status(200).json(categories);
        } catch (err) {
            res.status(500).json({ message: 'Failed to fetch categories', error: err });
        }
    };

    public getCategoryById = async (req: Request, res: Response): Promise<void> => {
        try {
            const category = await this.categoryRepository.findById(req.params.id, { populate: ['productCategories', 'locationCategories'] });
            if (!category || category.deletedAt) {
                res.status(404).json({ message: 'Category not found' });
                return;
            }
            res.status(200).json(category);
        } catch (err) {
            res.status(500).json({ message: 'Error fetching category', error: err });
        }
    };

    public createCategory = async (req: Request, res: Response): Promise<void> => {
        try {
            const { name, image } = req.body;
            const existingCategory = await this.categoryRepository.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') }});
            if (existingCategory) {
                res.status(409).json({ message: 'Category with this name already exists' });
                return;
            }
            const categoryData = { name, image, createdBy: "admin", updatedBy: "admin" };
            const category = await this.categoryRepository.create(categoryData);
            const locationCategories = req.body.locations || [];
            const locationCategoriesDocs = locationCategories.map((locationId: string) => ({ categoryId: category._id, locationId }));
            const savedLocationCategories = await LocationCategory.insertMany(locationCategoriesDocs);
            res.status(201).json({ message: 'Category created successfully', category, locationCategories: savedLocationCategories });
        } catch (err) {
            res.status(500).json({ message: 'Error creating category', error: err });
        }
    };

    public updateCategory = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const { name, image } = req.body;
            const updateData: any = { updatedBy: "", updatedAt: new Date() };
            if (name) updateData.name = name;
            if (image) updateData.image = image;
            const category = await this.categoryRepository.updateById(id, updateData);
            if (!category || category.deletedAt) {
                res.status(404).json({ message: 'Category not found' });
                return;
            }
            res.status(200).json({ message: 'Category updated successfully', category });
        } catch (err) {
            res.status(500).json({ message: 'Error updating category', error: err });
        }
    };

    public deleteCategory = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const category = await this.categoryRepository.findById(id);
            if (!category || category.deletedAt) {
                res.status(404).json({ message: 'Category not found' });
                return;
            }
            const deletedCategory = await this.categoryRepository.updateById(id, {
                deletedAt: new Date(),
                updatedBy: ""
            });
            await LocationCategory.deleteMany({ categoryId: id });
            res.status(200).json({ message: 'Category deleted successfully', category: deletedCategory });
        } catch (err) {
            res.status(500).json({ message: 'Error deleting category', error: err });
        }
    };

    public getProductsInCategory = async (req: Request, res: Response): Promise<void> => {
        try {
            const { categoryId } = req.params;
            const { page = 1, limit = 10 } = req.query;
            const category = await this.categoryRepository.findById(categoryId);
            if (!category || category.deletedAt) {
                res.status(404).json({ message: 'Category not found' });
                return;
            }
            const productCategories = await ProductCategory.find({ categoryId }).select('productId');
            const productIds = productCategories.map(pc => pc.productId);
            if (productIds.length === 0) {
                res.status(200).json({
                    category,
                    products: {
                        results: [],
                        pagination: {
                            currentPage: Number(page),
                            totalPages: 0,
                            total: 0,
                            hasNext: false,
                            hasPrev: false
                        }
                    }
                });
                return;
            }
            const products = await this.productRepository.find(
                { _id: { $in: productIds } },
                {
                    page: Number(page),
                    limit: Number(limit),
                    populate: [
                        { path: 'productOptions' },
                        { path: 'productContents' },
                        {
                            path: 'productCategories',
                            populate: { path: 'category' }
                        },
                        {
                            path: 'locationProducts',
                            populate: { path: 'location' }
                        }
                    ]
                }
            );
            res.status(200).json({
                category,
                products
            });
        } catch (err) {
            res.status(500).json({ message: 'Error fetching products in category', error: err });
        }
    };

    public addCategoryToLocation = async (req: Request, res: Response): Promise<void> => {
        try {
            const { categoryId, locationId } = req.body;

            // Verify category exists and is not deleted
            const category = await this.categoryRepository.findById(categoryId);
            if (!category || category.deletedAt) {
                res.status(404).json({ message: 'Category not found' });
                return;
            }

            // Check if association already exists
            const existingAssociation = await LocationCategory.findOne({ categoryId, locationId });
            if (existingAssociation) {
                res.status(409).json({ message: 'Category is already associated with this location' });
                return;
            }

            // Create the association
            const locationCategory = await LocationCategory.create({
                categoryId,
                locationId,
                createdBy: "", // Set based on your auth system
                updatedBy: ""
            });

            res.status(201).json({ 
                message: 'Category added to location successfully', 
                locationCategory 
            });
        } catch (err) {
            res.status(500).json({ message: 'Error adding category to location', error: err });
        }
    };

    public removeCategoryFromLocation = async (req: Request, res: Response): Promise<void> => {
        try {
            const { categoryId, locationId } = req.params;
            const result = await LocationCategory.deleteOne({ categoryId, locationId });
            if (result.deletedCount === 0) {
                res.status(404).json({ message: 'Category-location association not found' });
                return;
            }
            res.status(200).json({ message: 'Category removed from location successfully' });
        } catch (err) {
            res.status(500).json({ message: 'Error removing category from location', error: err });
        }
    };

    public getCategoriesByLocation = async (req: Request, res: Response): Promise<void> => {
        try {
            const { locationId } = req.params;
            const locationCategories = await LocationCategory.find({ locationId }).select('categoryId');
            const categoryIds = locationCategories.map(lc => lc.categoryId);
            if (categoryIds.length === 0) {
                res.status(200).json({
                    locationId,
                    categories: {
                        results: [],
                        pagination: {
                            currentPage: 1,
                            totalPages: 0,
                            total: 0,
                            hasNext: false,
                            hasPrev: false
                        }
                    }
                });
                return;
            }
            const categories = await this.categoryRepository.find(
                { 
                    _id: { $in: categoryIds },
                    deletedAt: null 
                },
                {
                    populate: ['productCategories']
                }
            );

            res.status(200).json({
                locationId,
                categories
            });
        } catch (err) {
            res.status(500).json({ message: 'Error fetching categories by location', error: err });
        }
    };
}