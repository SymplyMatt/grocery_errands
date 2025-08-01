import { FilterQuery, PopulateOptions, Types } from 'mongoose';
import { IProduct, IProductWithOptions, IProductWithCategories, IUser, IUserWithLocation, IOrder, IOrderWithProducts, ICart, ICartWithDetails, IProductWithDetails } from './interfaces';
import { Product, ProductOption, ProductCategory, User, Location, Order, OrderProduct, Cart } from '../models';

export class ModelHelpers {

    static async findUsersWithLocation( filter: FilterQuery<IUser> = {} ): Promise<IUserWithLocation[]> {
        return User.find(filter) .populate('location') .exec() as Promise<IUserWithLocation[]>;
    }

    static async findUserById( id: string | Types.ObjectId, includeLocation = false ): Promise<IUser | null> {
        let query = User.findById(id);

        if (includeLocation) {
            query = query.populate('location');
        }

        return query.exec();
    }

    static async findOrdersWithProducts(filter: FilterQuery<IOrder> = {}): Promise<IOrderWithProducts[]> {
        return Order.find(filter).populate({ path: 'orderProducts', populate: [ { path: 'product' }, { path: 'productOption' }]}).exec() as Promise<IOrderWithProducts[]>;
    }

    static async findOrderById( id: string | Types.ObjectId, includeProducts = false, includeUser = false ): Promise<IOrder | null> {
        let query = Order.findById(id);

        if (includeProducts) {
            query = query.populate({ path: 'orderProducts', populate: [ { path: 'product' }, { path: 'productOption' }]});
        }

        if (includeUser) {
            query = query.populate('user');
        }

        return query.exec();
    }

    static async findCartWithDetails(filter: FilterQuery<ICart> = {}): Promise<ICartWithDetails[]> {
        return Cart.find(filter).populate('product').populate('productOption').populate('user').exec() as Promise<ICartWithDetails[]>;
    }

    static async findUserCart( userId: string | Types.ObjectId, includeDetails = false): Promise<ICart[] | ICartWithDetails[]> {
        let query = Cart.find({ userId });
        
        if (includeDetails) {
            query = query.populate('product').populate('productOption').populate('user');
        }
        
        return query.exec();
    }

    static async softDeleteProduct( id: string | Types.ObjectId, deletedBy: string ): Promise<IProduct | null> {
        return Product.findByIdAndUpdate( id, { deletedAt: new Date(),updatedBy: deletedBy}, { new: true });
    }

    static async softDeleteUser( id: string | Types.ObjectId): Promise<IUser | null> {
        return User.findByIdAndUpdate( id, { deletedAt: new Date() }, { new: true });
    }

    static async restoreProduct( id: string | Types.ObjectId, restoredBy: string): Promise<IProduct | null> {
        return Product.findByIdAndUpdate(
        id,
        { 
            deletedAt: null,
            updatedBy: restoredBy
        },
        { new: true }
        );
    }

    static async getProductStats() {
        return Product.aggregate([
        {
            $group: {
            _id: null,
            totalProducts: { $sum: 1 },
            inSeasonProducts: {
                $sum: { $cond: ['$inSeason', 1, 0] }
            },
            outOfSeasonProducts: {
                $sum: { $cond: ['$inSeason', 0, 1] }
            }
            }
        }
        ]);
    }

    static async getUserOrderStats(userId: string | Types.ObjectId) {
        return Order.aggregate([
        { $match: { userId: new Types.ObjectId(userId.toString()) } },
        {
            $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalAmount: { $sum: '$total' }
            }
        }
        ]);
    }

    static isValidObjectId(id: string): boolean {
        return Types.ObjectId.isValid(id);
    }

    static toObjectId(id: string): Types.ObjectId {
        return new Types.ObjectId(id);
    }

    static async updateProductOptionStock( productOptionId: string | Types.ObjectId, quantity: number, operation: 'add' | 'subtract' = 'subtract' ): Promise<boolean> {
        const multiplier = operation === 'add' ? 1 : -1;
        const result = await ProductOption.updateOne(
        { 
            _id: productOptionId,
            stock: { $gte: operation === 'subtract' ? quantity : 0 }
        },
        { $inc: { stock: quantity * multiplier } }
        );
        
        return result.modifiedCount > 0;
    }

    static async checkProductOptionStock( productOptionId: string | Types.ObjectId, requiredQuantity: number ): Promise<boolean> {
        const productOption = await ProductOption.findById(productOptionId);
        return productOption ? productOption.stock >= requiredQuantity : false;
    }
}
