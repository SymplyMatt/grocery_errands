import mongoose, { Schema, model } from 'mongoose';
import { IOrder, OrderStatus, PaymentMethod } from '../interfaces';

const orderStatusEnum: OrderStatus[] = ['PENDING', 'DELIVERED', 'PAID'];
const paymentMethodEnum: PaymentMethod[] = ['TOPUP', 'PAYSTACK'];

const orderSchema = new Schema<IOrder>({
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
  address: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  firstname: {
    type: String,
    required: true
  },
  lastname: {
    type: String,
    required: true
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
    default: 'PAYSTACK'
  },
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
orderSchema.virtual('payments', {
  ref: 'Payment',
  localField: '_id',
  foreignField: 'orderId'
});
orderSchema.set('toJSON', { virtuals: true });
orderSchema.set('toObject', { virtuals: true });

export const Order = model<IOrder>('Order', orderSchema);
