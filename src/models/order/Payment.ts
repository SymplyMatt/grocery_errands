import { Schema, model } from 'mongoose';
import { IPayment, PaymentStatus, PaymentGateway } from '../interfaces';

const paymentStatusEnum: PaymentStatus[] = ['PENDING', 'SUCCESS', 'FAILED', 'CANCELLED', 'REFUNDED'];
const paymentGatewayEnum: PaymentGateway[] = ['PAYSTACK'];

const paymentSchema = new Schema<IPayment>({
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
  email: {
    type: String,
    required: true,
    lowercase: true
  },
  status: {
    type: String,
    enum: paymentStatusEnum,
    default: 'PENDING'
  },
  gateway: {
    type: String,
    enum: paymentGatewayEnum,
    default: 'PAYSTACK'
  },
  link: {
    type: String,
  },
  amount: {
    type: Number,
    required: true,
    get: (v: number) => parseFloat(v.toFixed(2)),
    set: (v: number) => parseFloat(v.toString())
  },
  reference: {
    type: String,
    sparse: true,
    unique: true
  },
  meta: {
    type: Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true,
  collection: 'payments',
  toJSON: { getters: true, virtuals: true },
  toObject: { getters: true, virtuals: true }
});

// Virtual for order
paymentSchema.virtual('order', {
  ref: 'Order',
  localField: 'orderId',
  foreignField: '_id',
  justOne: true
});

// Virtual for user
paymentSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

// Index for better query performance
paymentSchema.index({ orderId: 1 });
paymentSchema.index({ userId: 1 });
paymentSchema.index({ reference: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ gateway: 1 });

export const Payment = model<IPayment>('Payment', paymentSchema);