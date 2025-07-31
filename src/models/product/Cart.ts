import { Schema, model } from 'mongoose';
import { ICart } from '../interfaces';

const cartSchema = new Schema<ICart>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productOptionId: {
    type: Schema.Types.ObjectId,
    ref: 'ProductOption',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
    min: 1
  }
}, {
  timestamps: true,
  collection: 'carts'
});


cartSchema.index({ userId: 1, productOptionId: 1 }, { unique: true });

cartSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

cartSchema.virtual('product', {
  ref: 'Product',
  localField: 'productId',
  foreignField: '_id',
  justOne: true
});

cartSchema.virtual('productOption', {
  ref: 'ProductOption',
  localField: 'productOptionId',
  foreignField: '_id',
  justOne: true
});

cartSchema.set('toJSON', { virtuals: true });
cartSchema.set('toObject', { virtuals: true });

export const Cart = model<ICart>('Cart', cartSchema);
