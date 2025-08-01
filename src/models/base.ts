import { Document, Model, FilterQuery, UpdateQuery, QueryOptions, PopulateOptions } from 'mongoose';
interface FindOptions extends Omit<QueryOptions, 'populate'> {
  page?: number;
  limit?: number;
  sort?: Record<string, 1 | -1>;
  populate?: string | PopulateOptions | string[] | PopulateOptions[];
}
export class BaseRepository<T extends Document> {
  protected model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  async findById( id: string, options?: QueryOptions & { populate?: string | PopulateOptions | (string | PopulateOptions)[] }): Promise<T | null> {
    let query = this.model.findById(id, null, options);
    if (options?.populate) {
      const populates = Array.isArray(options.populate) ? options.populate : [options.populate];
      for (const p of populates) {
        query = query.populate(p as any);
      }
    }
    return query.exec();
  }

  async findOne(filter: FilterQuery<T>, options?: QueryOptions): Promise<T | null> {
    return this.model.findOne(filter, null, options);
  }

  async find( filter: FilterQuery<T> = {}, options: FindOptions = {}
  ): Promise<{
    data: T[];
    pagination: {
      currentPage: number;
      totalPages: number;
      total: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    const { page = 1, limit = 10, sort = { createdAt: -1 }, populate, ...queryOptions } = options;
    const skip = (page - 1) * limit;
    const total = await this.model.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);
    let query = this.model.find(filter, null, queryOptions).sort(sort).skip(skip).limit(limit);
    if (populate) {
      const populates = Array.isArray(populate) ? populate : [populate];
      query.populate(populates);
    }    

    const results = await query.exec();

    return {
      data: results,
      pagination: {
        currentPage: page,
        totalPages,
        total,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
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