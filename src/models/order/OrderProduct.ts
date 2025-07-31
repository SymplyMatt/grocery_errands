import { Schema, model } from 'mongoose';
import { IOrderProduct } from '../index';

const orderProductSchema = new Schema<IOrderProduct>({
  orderId: {
    type: Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
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
    min: 1
  },
  price: {
    type: Number,
    required: true,
    get: (v: number) => parseFloat(v.toFixed(2)),
    set: (v: number) => parseFloat(v.toString())
  }
}, {
  timestamps: true,
  collection: 'order_products',
  toJSON: { getters: true },
  toObject: { getters: true }
});

orderProductSchema.virtual('order', {
  ref: 'Order',
  localField: 'orderId',
  foreignField: '_id',
  justOne: true
});

orderProductSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

orderProductSchema.virtual('product', {
  ref: 'Product',
  localField: 'productId',
  foreignField: '_id',
  justOne: true
});

orderProductSchema.virtual('productOption', {
  ref: 'ProductOption',
  localField: 'productOptionId',
  foreignField: '_id',
  justOne: true
});

orderProductSchema.set('toJSON', { virtuals: true });
orderProductSchema.set('toObject', { virtuals: true });

export const OrderProduct = model<IOrderProduct>('OrderProduct', orderProductSchema);
