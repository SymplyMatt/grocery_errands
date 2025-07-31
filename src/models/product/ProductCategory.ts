import { Schema, model } from 'mongoose';
import { IProductCategory } from '../interfaces';

const productCategorySchema = new Schema<IProductCategory>({
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  categoryId: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  }
}, {
  timestamps: { createdAt: true, updatedAt: false },
  collection: 'product_categories'
});

productCategorySchema.index({ productId: 1, categoryId: 1 }, { unique: true });

productCategorySchema.virtual('product', {
  ref: 'Product',
  localField: 'productId',
  foreignField: '_id',
  justOne: true
});

productCategorySchema.virtual('category', {
  ref: 'Category',
  localField: 'categoryId',
  foreignField: '_id',
  justOne: true
});

productCategorySchema.set('toJSON', { virtuals: true });
productCategorySchema.set('toObject', { virtuals: true });

export const ProductCategory = model<IProductCategory>('ProductCategory', productCategorySchema);
