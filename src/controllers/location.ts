import { Request, Response } from 'express';
import { BaseRepository } from '../models/base';
import { ILocation, Location, IProduct, Product, ICategory, Category, LocationProduct, LocationCategory, ProductCategory } from '../models';

export class LocationController {
    private locationRepository: BaseRepository<ILocation>;
    private productRepository: BaseRepository<IProduct>;
    private categoryRepository: BaseRepository<ICategory>;

    constructor() {
        this.locationRepository = new BaseRepository<ILocation>(Location);
        this.productRepository = new BaseRepository<IProduct>(Product);
        this.categoryRepository = new BaseRepository<ICategory>(Category);
    }

    public getAllLocations = async (req: Request, res: Response): Promise<void> => {
        try {
            const locations = await this.locationRepository.find({}, { populate: ['locationProducts', 'locationCategories'] });
            res.status(200).json(locations);
        } catch (err) {
            res.status(500).json({ message: 'Failed to fetch locations', error: err });
        }
    };

    public getLocationById = async (req: Request, res: Response): Promise<void> => {
        try {
            const location = await this.locationRepository.findById(req.params.id, { populate: ['locationProducts', 'locationCategories']});
            if (!location) {
                res.status(404).json({ message: 'Location not found' });
                return;
            }
            res.status(200).json(location);
        } catch (err) {
            res.status(500).json({ message: 'Error fetching location', error: err });
        }
    };

    public createLocation = async (req: Request, res: Response): Promise<void> => {
        try {
            const { name } = req.body;
            const existingLocation = await this.locationRepository.findOne({ name });
            if (existingLocation) {
                res.status(409).json({ message: 'Location with this name already exists' });
                return;
            }
            const locationData = {name,createdBy: "",updatedBy: "" };
            const location = await this.locationRepository.create(locationData);
            res.status(201).json({ message: 'Location created successfully', location });
        } catch (err) {
            res.status(500).json({ message: 'Error creating location', error: err });
        }
    };

    public updateLocation = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const { name } = req.body;
            if (name) {
                const existingLocation = await this.locationRepository.findOne({ name, _id: { $ne: id } });
                if (existingLocation) {
                    res.status(409).json({ message: 'Location with this name already exists' });
                    return;
                }
            }
            const updateData: any = { updatedBy: "", updatedAt: new Date()};
            if (name) updateData.name = name;
            const location = await this.locationRepository.updateById(id, updateData);
            if (!location) {
                res.status(404).json({ message: 'Location not found' });
                return;
            }
            res.status(200).json({ message: 'Location updated successfully', location });
        } catch (err) {
            res.status(500).json({ message: 'Error updating location', error: err });
        }
    };

    public deleteLocation = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const location = await this.locationRepository.findById(id);
            if (!location) {
                res.status(404).json({ message: 'Location not found' });
                return;
            }
            const productCount = await LocationProduct.countDocuments({ locationId: id });
            const categoryCount = await LocationCategory.countDocuments({ locationId: id });
            if (categoryCount > 0) {
                res.status(400).json({ 
                    message: 'Cannot delete location with associated categories', 
                    categoryCount 
                });
                return;
            }
            await this.locationRepository.deleteById(id);
            res.status(200).json({ message: 'Location deleted successfully' });
        } catch (err) {
            res.status(500).json({ message: 'Error deleting location', error: err });
        }
    };

    public getLocationCategories = async (req: Request, res: Response): Promise<void> => {
        try {
            const { locationId } = req.params;
            const { page = 1, limit = 10 } = req.query;
            const location = await this.locationRepository.findById(locationId);
            if (!location) {
                res.status(404).json({ message: 'Location not found' });
                return;
            }
            const locationCategories = await LocationCategory.find({ locationId }).select('categoryId');
            const categoryIds = locationCategories.map(lc => lc.categoryId);

            if (categoryIds.length === 0) {
                res.status(200).json({
                    location,
                    categories: {
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
            const categories = await this.categoryRepository.find(
                { 
                    _id: { $in: categoryIds },
                    deletedAt: null
                },
                {
                    page: Number(page),
                    limit: Number(limit),
                    populate: ['productCategories']
                }
            );
            res.status(200).json({
                location,
                categories
            });
        } catch (err) {
            res.status(500).json({ message: 'Error fetching location categories', error: err });
        }
    };

    public getLocationProducts = async (req: Request, res: Response): Promise<void> => {
        try {
            const { locationId } = req.params;
            const { page = 1, limit = 10, category } = req.query;
            const locationProducts = await LocationProduct.find({ locationId }).select('productId');
            const productIds = locationProducts.map(lp => lp.productId);
            if (productIds.length === 0) {
                res.status(200).json({
                    location,
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
            let productFilter: any = { _id: { $in: productIds } };
            const products = await this.productRepository.find(
                productFilter,
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
            res.status(200).json({ location, products,
                filters: { category: category || null }
            });
        } catch (err) {
            res.status(500).json({ message: 'Error fetching location products', error: err });
        }
    };
    
    public getLocationStats = async (req: Request, res: Response): Promise<void> => {
        try {
            const { locationId } = req.params;
            const location = await this.locationRepository.findById(locationId);
            if (!location) {
                res.status(404).json({ message: 'Location not found' });
                return;
            }
            const [productCount, categoryCount] = await Promise.all([
                LocationProduct.countDocuments({ locationId }),
                LocationCategory.countDocuments({ locationId })
            ]);
            res.status(200).json({
                location,
                statistics: { totalProducts: productCount, totalCategories: categoryCount }
            });
        } catch (err) {
            res.status(500).json({ message: 'Error fetching location statistics', error: err });
        }
    };
}