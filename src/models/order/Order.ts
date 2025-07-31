import mongoose, { Schema, model } from 'mongoose';
import { IOrder, OrderStatus, PaymentMethod } from '../interfaces';

const orderStatusEnum: OrderStatus[] = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];
const paymentMethodEnum: PaymentMethod[] = ['TOPUP', 'PAYSTACK'];

const orderSchema = new Schema<IOrder>({
  orderNumber: {
    type: String,
    required: true,
    unique: true,
    default: () => new mongoose.Types.ObjectId().toString()
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: orderStatusEnum,
    default: 'PENDING'
  },
  total: {
    type: Number,
    required: true,
    get: (v: number) => parseFloat(v.toFixed(2)),
    set: (v: number) => parseFloat(v.toString())
  },
  delivery: {
    type: Number,
    required: true,
    get: (v: number) => parseFloat(v.toFixed(2)),
    set: (v: number) => parseFloat(v.toString())
  },
  paymentMethod: {
    type: String,
    enum: paymentMethodEnum,
    required: true
  },
  meta: {
    type: Schema.Types.Mixed,
    default: {}
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
  collection: 'orders',
  toJSON: { getters: true },
  toObject: { getters: true }
});

orderSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

// Virtual for order products
orderSchema.virtual('orderProducts', {
  ref: 'OrderProduct',
  localField: '_id',
  foreignField: 'orderId'
});

// Query helper for soft delete
orderSchema.statics.findNotDeleted = function() {
  return this.where({ deletedAt: null });
};

orderSchema.set('toJSON', { virtuals: true });
orderSchema.set('toObject', { virtuals: true });

export const Order = model<IOrder>('Order', orderSchema);
