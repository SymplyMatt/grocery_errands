import { Schema, model } from 'mongoose';
import { IProduct } from '../interfaces';

const productSchema = new Schema<IProduct>({
  name: {
    type: String,
    required: true
  },
  inSeason: {
    type: Boolean,
    default: true
  },
  description: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  deletedAt: {
    type: Date,
    default: null
  },
  createdBy: {
    type: String,
    required: true
  },
  updatedBy: {
    type: String,
    required: true
  }
}, {
  timestamps: true,
  collection: 'products'
});

productSchema.virtual('productOptions', {
  ref: 'ProductOption',
  localField: '_id',
  foreignField: 'productId'
});

productSchema.virtual('productCategories', {
  ref: 'ProductCategory',
  localField: '_id',
  foreignField: 'productId'
});

productSchema.virtual('locationProducts', {
  ref: 'LocationProduct',
  localField: '_id',
  foreignField: 'productId'
});

productSchema.virtual('carts', {
  ref: 'Cart',
  localField: '_id',
  foreignField: 'productId'
});

productSchema.virtual('orderProducts', {
  ref: 'OrderProduct',
  localField: '_id',
  foreignField: 'productId'
});

productSchema.virtual('productContents', {
  ref: 'ProductContent',
  localField: '_id',
  foreignField: 'productId'
});

productSchema.statics.findNotDeleted = function() {
  return this.where({ deletedAt: null });
};

productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

export const Product = model<IProduct>('Product', productSchema);
