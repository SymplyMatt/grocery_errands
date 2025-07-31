import { Schema, model } from 'mongoose';
import { IProductContent } from '../index';

const productContentSchema = new Schema<IProductContent>({
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  createdBy: {
    type: String,
    required: true
  }
}, {
  timestamps: { createdAt: true, updatedAt: false },
  collection: 'product_contents'
});

productContentSchema.virtual('product', {
  ref: 'Product',
  localField: 'productId',
  foreignField: '_id',
  justOne: true
});

productContentSchema.set('toJSON', { virtuals: true });
productContentSchema.set('toObject', { virtuals: true });

export const ProductContent = model<IProductContent>('ProductContent', productContentSchema);
