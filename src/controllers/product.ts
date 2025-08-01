import { Request, Response } from 'express';
import { PopulateOptions } from 'mongoose';
import { Product } from '../models/product/Product';
import { BaseRepository } from '../models/base';
import { IProduct } from '../models';

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
}
