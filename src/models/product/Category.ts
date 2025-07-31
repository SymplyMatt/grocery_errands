import { Schema, model } from 'mongoose';
import { ICategory } from '../index';

const categorySchema = new Schema<ICategory>({
  name: {
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
  collection: 'categories'
});

categorySchema.virtual('productCategories', {
  ref: 'ProductCategory',
  localField: '_id',
  foreignField: 'categoryId'
});

categorySchema.virtual('locationCategories', {
  ref: 'LocationCategory',
  localField: '_id',
  foreignField: 'categoryId'
});

categorySchema.statics.findNotDeleted = function() {
  return this.where({ deletedAt: null });
};

categorySchema.set('toJSON', { virtuals: true });
categorySchema.set('toObject', { virtuals: true });

export const Category = model<ICategory>('Category', categorySchema);
