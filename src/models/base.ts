import { Document, Model, FilterQuery, UpdateQuery, QueryOptions } from 'mongoose';

export class BaseRepository<T extends Document> {
  protected model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  async findById(id: string, options?: QueryOptions): Promise<T | null> {
    return this.model.findById(id, null, options);
  }

  async findOne(filter: FilterQuery<T>, options?: QueryOptions): Promise<T | null> {
    return this.model.findOne(filter, null, options);
  }

  async find(filter: FilterQuery<T> = {}, options?: QueryOptions): Promise<T[]> {
    return this.model.find(filter, null, options);
  }

  async create(data: Partial<T>): Promise<T> {
    return this.model.create(data);
  }

  async updateById(
    id: string,
    update: UpdateQuery<T>,
    options?: QueryOptions
  ): Promise<T | null> {
    return this.model.findByIdAndUpdate(id, update, {
      new: true,
      ...options
    });
  }

  async updateOne(
    filter: FilterQuery<T>,
    update: UpdateQuery<T>,
    options?: QueryOptions
  ): Promise<T | null> {
    return this.model.findOneAndUpdate(filter, update, {
      new: true,
      ...options
    });
  }

  async deleteById(id: string): Promise<T | null> {
    return this.model.findByIdAndDelete(id);
  }

  async deleteOne(filter: FilterQuery<T>): Promise<T | null> {
    return this.model.findOneAndDelete(filter);
  }

  async count(filter: FilterQuery<T> = {}): Promise<number> {
    return this.model.countDocuments(filter);
  }

  async exists(filter: FilterQuery<T>): Promise<boolean> {
    const doc = await this.model.findOne(filter).select('_id').lean();
    return !!doc;
  }
}