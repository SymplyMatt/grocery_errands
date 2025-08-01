import { Request, Response } from 'express';
import { FilterQuery, PopulateOptions, Types } from 'mongoose';
import { Product } from '../models/product/Product';
import { BaseRepository } from '../models/base';
import { ILocationProduct, IProduct, LocationProduct } from '../models';

export class ProductController {
    private productRepository: BaseRepository<IProduct>;

    constructor() {
        this.productRepository = new BaseRepository<IProduct>(Product);
    }

    public getAllProducts = async (req: Request, res: Response): Promise<void> => {
        try {
          const products = await this.productRepository.find({}, {
            populate: [
                { path: 'productOptions' },
                { path: 'productContents' },
                {
                  path: 'productCategories',
                  populate: { path: 'category' }
                }
              ] as PopulateOptions[]
          });
          res.status(200).json(products);
        } catch (err) {
          res.status(500).json({ message: 'Failed to fetch products', error: err });
        }
    }; 

    public getProductById = async (req: Request, res: Response): Promise<void> => {
        try {
        const product = await this.productRepository.findById(req.params.id);
        if (!product) {
            res.status(404).json({ message: 'Product not found' });
            return;
        }
        res.status(200).json(product);
        } catch (err) {
        res.status(500).json({ message: 'Error fetching product', error: err });
        }
    };
}
export class LocationController {
    private productRepository: BaseRepository<ILocationProduct>;

    constructor() {
        this.productRepository = new BaseRepository<ILocationProduct>(LocationProduct);
    }

    public getLocationWithProducts = async (req: Request, res: Response): Promise<void> => {
      try {
        const products = await this.productRepository.find({ locationId:req.params.locationId }, {
          populate: [
            { path: 'location' },
            {
              path: 'product',
              populate: [
                { path: 'productOptions' },
                { path: 'productContents' },
                {
                  path: 'productCategories',
                  populate: { path: 'category' }
                }
              ] as PopulateOptions[]
            }
          ]
        });
        res.status(200).json(products);
      } catch (err) {
        res.status(500).json({ message: 'Failed to fetch products', error: err });
      }
    };
}
