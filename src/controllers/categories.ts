import { Request, Response } from 'express';
import { BaseRepository } from '../models/base';
import { Category, ICategory } from '../models';

export class CategoryController {
    private categoryRepository: BaseRepository<ICategory>;

    constructor() {
        this.categoryRepository = new BaseRepository<ICategory>(Category);
    }

    public getAllCategories = async (req: Request, res: Response): Promise<void> => {
        try {
            const categories = await this.categoryRepository.find({});
            res.status(200).json(categories);
        } catch (err) {
            res.status(500).json({ message: 'Failed to fetch categories', error: err });
        }
    };

    public getCategoryById = async (req: Request, res: Response): Promise<void> => {
        try {
            const category = await this.categoryRepository.findById(req.params.id);
            if (!category) {
                res.status(404).json({ message: 'Category not found' });
                return;
            }
            res.status(200).json(location);
        } catch (err) {
        res.status(500).json({ message: 'Error fetching category', error: err });
        }
    };

    public createCategory = async (req: Request, res: Response): Promise<void> => {
        try {
            const category = await this.categoryRepository.create(req.body);
            res.status(201).json(location);
        } catch (err) {
            res.status(500).json({ message: 'Error creating category', error: err });
        }
    };

    public updateCategory = async (req: Request, res: Response): Promise<void> => {
        try {
            const category = await this.categoryRepository.updateById(req.params.id, req.body);
            if (!category) {
                res.status(404).json({ message: 'Category not found' });
                return;
            }
            res.status(200).json(location);
        } catch (err) {
            res.status(500).json({ message: 'Error updating category', error: err });
        }
    };
}
