import { Types } from 'mongoose';
import { CustomValidator } from 'express-validator';

export const isMongoId: CustomValidator = (value: any) => {
  if (!value) return false;
  return Types.ObjectId.isValid(value);
};

