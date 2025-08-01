import { Request, Response } from 'express';
import { PopulateOptions } from 'mongoose';
import { BaseRepository } from '../models/base';
import { ILocationProduct, LocationProduct } from '../models';

export class LocationProductController {
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
