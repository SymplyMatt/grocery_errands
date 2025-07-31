// types/index.ts
import { Document, Types } from 'mongoose';

// Base interfaces for common fields
export interface ITimestamps {
  createdAt: Date;
  updatedAt: Date;
}

export interface ISoftDelete {
  deletedAt?: Date | null;
}

export interface IAuditFields {
  createdBy: string;
  updatedBy: string;
}

// Core entity interfaces
export interface ILocation extends Document, ITimestamps {
  _id: Types.ObjectId;
  name: string;
  
  // Virtual associations
  locationProducts?: ILocationProduct[];
  locationCategories?: ILocationCategory[];
  users?: IUser[];
}

export interface ICategory extends Document, ITimestamps, ISoftDelete, IAuditFields {
  _id: Types.ObjectId;
  name: string;
  image: string;
  
  // Virtual associations
  productCategories?: IProductCategory[];
  locationCategories?: ILocationCategory[];
}

export interface IProduct extends Document, ITimestamps, ISoftDelete, IAuditFields {
  _id: Types.ObjectId;
  name: string;
  inSeason: boolean;
  description: string;
  image: string;
  
  // Virtual associations
  productOptions?: IProductOption[];
  productCategories?: IProductCategory[];
  locationProducts?: ILocationProduct[];
  carts?: ICart[];
  orderProducts?: IOrderProduct[];
  productContents?: IProductContent[];
}

export interface IProductOption extends Document, ITimestamps, ISoftDelete, IAuditFields {
  _id: Types.ObjectId;
  productId: Types.ObjectId;
  name: string;
  price: number;
  image: string;
  stock: number;
  
  // Virtual associations
  product?: IProduct;
  carts?: ICart[];
  orderProducts?: IOrderProduct[];
}

export interface IUser extends Document, ITimestamps, ISoftDelete {
  _id: Types.ObjectId;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  whatsapp?: string | null;
  locationId: Types.ObjectId;
  username: string;
  
  // Virtual associations
  location?: ILocation;
  userAuth?: IUserAuth;
  carts?: ICart[];
  verificationCodes?: IVerificationCode[];
  userTopUps?: IUserTopUp[];
  orders?: IOrder[];
  orderProducts?: IOrderProduct[];
  notifications?: INotification[];
  deliveryAddresses?: IDeliveryAddress[];
}

export interface IAdmin extends Document, ITimestamps, ISoftDelete {
  _id: Types.ObjectId;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  createdBy?: string | null;
  updatedBy?: string | null;
  
  // Virtual associations
  adminAuth?: IAdminAuth;
}

// Junction/Association interfaces
export interface IProductCategory extends Document {
  _id: Types.ObjectId;
  productId: Types.ObjectId;
  categoryId: Types.ObjectId;
  createdAt: Date;
  
  // Virtual associations
  product?: IProduct;
  category?: ICategory;
}

export interface ILocationProduct extends Document {
  _id: Types.ObjectId;
  locationId: Types.ObjectId;
  productId: Types.ObjectId;
  createdAt: Date;
  
  // Virtual associations
  location?: ILocation;
  product?: IProduct;
}

export interface ILocationCategory extends Document {
  _id: Types.ObjectId;
  locationId: Types.ObjectId;
  categoryId: Types.ObjectId;
  createdAt: Date;
  
  // Virtual associations
  location?: ILocation;
  category?: ICategory;
}

// Auth interfaces
export interface IUserAuth extends Document, ITimestamps {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  password: string;
  
  // Virtual associations
  user?: IUser;
}

export interface IAdminAuth extends Document, ITimestamps {
  _id: Types.ObjectId;
  adminId: Types.ObjectId;
  password: string;
  
  // Virtual associations
  admin?: IAdmin;
}

// Cart interface
export interface ICart extends Document, ITimestamps {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  productId: Types.ObjectId;
  productOptionId: Types.ObjectId;
  quantity: number;
  
  // Virtual associations
  user?: IUser;
  product?: IProduct;
  productOption?: IProductOption;
}

// Content and verification interfaces
export interface IProductContent extends Document {
  _id: Types.ObjectId;
  productId: Types.ObjectId;
  content: string;
  createdBy: string;
  createdAt: Date;
  
  // Virtual associations
  product?: IProduct;
}

export interface IVerificationCode extends Document, ITimestamps {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  code: string;
  expiresIn: Date;
  isUsed: boolean;
  
  // Virtual associations
  user?: IUser;
}

// Financial interfaces
export type TopUpStatus = 'PENDING' | 'SUCCESS' | 'FAILED';

export interface IUserTopUp extends Document, ITimestamps, ISoftDelete, IAuditFields {
  _id: Types.ObjectId;
  referenceNumber: string;
  userId: Types.ObjectId;
  amount: number;
  status: TopUpStatus;
  meta: Record<string, any>;
  
  // Virtual associations
  user?: IUser;
}

// Order interfaces
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';
export type PaymentMethod = 'TOPUP' | 'PAYSTACK';

export interface IOrder extends Document, ITimestamps, ISoftDelete, IAuditFields {
  _id: Types.ObjectId;
  orderNumber: string;
  userId: Types.ObjectId;
  status: OrderStatus;
  total: number;
  delivery: number;
  paymentMethod: PaymentMethod;
  meta: Record<string, any>;
  
  // Virtual associations
  user?: IUser;
  orderProducts?: IOrderProduct[];
}

export interface IOrderProduct extends Document, ITimestamps {
  _id: Types.ObjectId;
  orderId: Types.ObjectId;
  userId: Types.ObjectId;
  productId: Types.ObjectId;
  productOptionId: Types.ObjectId;
  quantity: number;
  price: number;
  
  // Virtual associations
  order?: IOrder;
  user?: IUser;
  product?: IProduct;
  productOption?: IProductOption;
}

// Notification interface
export interface INotification extends Document, ITimestamps {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  message: string;
  read: boolean;
  action: string;
  
  // Virtual associations
  user?: IUser;
}

// Delivery address interface
export interface IDeliveryAddress extends Document, ITimestamps {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  firstname: string;
  lastname: string;
  phone: string;
  state: string;
  lga: string;
  address: string;
  email: string;
  
  // Virtual associations
  user?: IUser;
}

// Population types for better type safety
export interface IProductWithOptions extends IProduct {
  productOptions: IProductOption[];
}

export interface IProductWithCategories extends IProduct {
  productCategories: (IProductCategory & { category: ICategory })[];
}

export interface IUserWithLocation extends IUser {
  location: ILocation;
}

export interface IOrderWithProducts extends IOrder {
  orderProducts: (IOrderProduct & { 
    product: IProduct; 
    productOption: IProductOption 
  })[];
}

export interface ICartWithDetails extends ICart {
  product: IProduct;
  productOption: IProductOption;
  user: IUser;
}