import { Document, Types } from 'mongoose';

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

export interface ILocation extends Document, ITimestamps {
  _id: Types.ObjectId;
  name: string;

  locationProducts?: ILocationProduct[];
  locationCategories?: ILocationCategory[];
  users?: IUser[];
}

export interface ICategory extends Document, ITimestamps, ISoftDelete, IAuditFields {
  _id: Types.ObjectId;
  name: string;
  image: string;

  productCategories?: IProductCategory[];
  locationCategories?: ILocationCategory[];
}

export interface IProduct extends Document, ITimestamps, ISoftDelete, IAuditFields {
  _id: Types.ObjectId;
  name: string;
  inSeason: boolean;
  description: string;
  image: string;
  
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
  locationId: Types.ObjectId | null;
  username: string;
  verified: boolean;
  
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
  verified: boolean;
  createdBy?: string | null;
  updatedBy?: string | null;
  
  adminAuth?: IAdminAuth;
}

export interface IProductCategory extends Document {
  _id: Types.ObjectId;
  productId: Types.ObjectId;
  categoryId: Types.ObjectId;
  createdAt: Date;
  
  product?: IProduct;
  category?: ICategory;
}

export interface ILocationProduct extends Document {
  _id: Types.ObjectId;
  locationId: Types.ObjectId;
  productId: Types.ObjectId;
  createdAt: Date;
  
  location?: ILocation;
  product?: IProduct;
}

export interface ILocationCategory extends Document {
  _id: Types.ObjectId;
  locationId: Types.ObjectId;
  categoryId: Types.ObjectId;
  createdAt: Date;
  
  location?: ILocation;
  category?: ICategory;
}

export interface IUserAuth extends Document, ITimestamps {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  password: string;
  
  user?: IUser;
}

export interface IAdminAuth extends Document, ITimestamps {
  _id: Types.ObjectId;
  adminId: Types.ObjectId;
  password: string;

  admin?: IAdmin;
}

// Cart interface
export interface ICart extends Document, ITimestamps {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  productId: Types.ObjectId;
  productOptionId: Types.ObjectId;
  quantity: number;

  user?: IUser;
  product?: IProduct;
  productOption?: IProductOption;
}

export interface IProductContent extends Document {
  _id: Types.ObjectId;
  productId: Types.ObjectId;
  content: string;
  createdBy: string;
  createdAt: Date;

  product?: IProduct;
}

export interface IVerificationCode extends Document, ITimestamps {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  code: string;
  expiresIn: Date;
  isUsed: boolean;

  user?: IUser;
}

export type TopUpStatus = 'PENDING' | 'SUCCESS' | 'FAILED';

export interface IUserTopUp extends Document, ITimestamps, ISoftDelete, IAuditFields {
  _id: Types.ObjectId;
  referenceNumber: string;
  userId: Types.ObjectId;
  amount: number;
  status: TopUpStatus;
  meta: Record<string, any>;

  user?: IUser;
}

export type OrderStatus = 'PENDING' | 'DELIVERED' | 'PAID';
export type PaymentMethod = 'TOPUP' | 'PAYSTACK';

export interface IOrder extends Document, ITimestamps {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  status: OrderStatus;
  total: number;
  delivery: number;
  address: string;
  state: string;
  email: string;
  phone: string;
  firstname: string;
  lastname: string;
  paymentMethod: PaymentMethod;

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

  user?: IUser;
}

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

  user?: IUser;
}
export interface IProductWithOptions extends IProduct {
  productOptions: IProductOption[];
}

export interface IProductWithCategories extends IProduct {
  productCategories: (IProductCategory & { category: ICategory })[];
}
export interface IProductWithOptionsAndCategories extends IProduct {
  productOptions: IProductOption[];
  productCategories: (IProductCategory & { category: ICategory })[];
}
export interface IProductWithDetails extends IProduct {
  productOptions: IProductOption[];
  productCategories: (IProductCategory & { category: ICategory })[];
  locationProducts?: (ILocationProduct & { location: ILocation })[];
}
export interface IProductWithDetails extends IProduct {
  productOptions: IProductOption[];
  productCategories: (IProductCategory & { category: ICategory })[];
  locationProducts?: (ILocationProduct & { location: ILocation })[];
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

export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'REFUNDED';
export type PaymentGateway = 'PAYSTACK';
export interface IPayment extends Document, ITimestamps {
  _id: Types.ObjectId;
  orderId: Types.ObjectId;
  userId: Types.ObjectId;
  email: string;
  link: string;
  status: PaymentStatus;
  gateway: PaymentGateway;
  amount: number;
  reference?: string;
  meta?: Record<string, any>;

  order?: IOrder;
  user?: IUser;
}