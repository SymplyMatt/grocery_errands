import { Schema, model } from 'mongoose';
import { IProductOption } from '../index';

const productOptionSchema = new Schema<IProductOption>({
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    get: (v: number) => parseFloat(v.toFixed(2)),
    set: (v: number) => parseFloat(v.toString())
  },
  image: {
    type: String,
    required: true
  },
  stock: {
    type: Number,
    required: true,
    min: 0
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
  collection: 'product_options',
  toJSON: { getters: true },
  toObject: { getters: true }
});

productOptionSchema.virtual('product', {
  ref: 'Product',
  localField: 'productId',
  foreignField: '_id',
  justOne: true
});

productOptionSchema.virtual('carts', {
  ref: 'Cart',
  localField: '_id',
  foreignField: 'productOptionId'
});

productOptionSchema.virtual('orderProducts', {
  ref: 'OrderProduct',
  localField: '_id',
  foreignField: 'productOptionId'
});

productOptionSchema.statics.findNotDeleted = function() {
  return this.where({ deletedAt: null });
};

export const ProductOption = model<IProductOption>('ProductOption', productOptionSchema);
