import { Request, Response } from 'express';
import { PopulateOptions } from 'mongoose';
import { BaseRepository } from '../models/base';
import { Cart, ICart, Product, IProduct, ProductOption, IProductOption } from '../models';
import { AuthRequest } from '../middleware/authenticateToken';

export class CartController {
  private cartRepository: BaseRepository<ICart>;
  private productRepository: BaseRepository<IProduct>;
  private productOptionRepository: BaseRepository<IProductOption>;
  private populationOptions: PopulateOptions[];

  constructor() {
    this.cartRepository = new BaseRepository<ICart>(Cart);
    this.productRepository = new BaseRepository<IProduct>(Product);
    this.productOptionRepository = new BaseRepository<IProductOption>(ProductOption);
    
    this.populationOptions = [
      { path: 'user' },
      {
        path: 'product',
        populate: [
          { path: 'productOptions' }, 
          { path: 'productCategories' }, 
          { path: 'productContents' }
        ],
      },
      { path: 'productOption' }
    ];
  }

    public addToCart = async (req: Request, res: Response): Promise<void> => {
        try {
            const { productId, productOptionId, quantity = 1 } = req.body;
            const userId = (req as AuthRequest).user;
            const product = await this.productRepository.findById(productId);
            if (!product) {
                res.status(401).json({ error: 'Product not found' });
                return;
            }
            const productOption = await this.productOptionRepository.findById(productOptionId);
            if (!productOption || productOption.productId.toString() !== productId) {
                res.status(401).json({ 
                    error: 'Product option not found or does not belong to this product' 
                });
                return;
            }
            const existingCartItem = await this.cartRepository.findOne({ userId, productOptionId });
            let cartItem: ICart;
            if (existingCartItem) {
                cartItem = await this.cartRepository.updateById(existingCartItem.id.toString(),{ $inc: { quantity } },{ new: true } ) as ICart;
            } else {
                cartItem = await this.cartRepository.create({ userId, productId, productOptionId, quantity });
            }
            const populatedCartItem = await this.cartRepository.findById( cartItem._id.toString() );
            res.status(201).json({
                message: existingCartItem ? 'Cart item updated successfully' : 'Item added to cart successfully',
                cartItem: populatedCartItem
            });

        } catch (error) {
            console.error('Error adding to cart:', error);
            res.status(500).json({ error: 'Failed to add item to cart' });
        }
    };
    
    public updateCartItem = async (req: Request, res: Response): Promise<void> => {
        try {
            const { cartItemId } = req.params;
            const { quantity } = req.body;
            const userId = (req as AuthRequest).user;
            const cartItem = await this.cartRepository.findOne({ _id: cartItemId, userId });
            if (!cartItem) {
                res.status(404).json({ error: 'Cart item not found' });
                return;
            }
            const updatedCartItem = await this.cartRepository.updateById( cartItemId, { quantity }, { new: true } );
            const populatedCartItem = await this.cartRepository.findById(
                updatedCartItem!._id.toString(),
                { populate: this.populationOptions }
            );
            res.status(200).json({
                message: 'Cart item updated successfully',
                cartItem: populatedCartItem
            });
        } catch (error) {
            console.error('Error updating cart item:', error);
            res.status(500).json({ error: 'Failed to update cart item' });
        }
    };

    public removeFromCart = async (req: Request, res: Response): Promise<void> => {
        try {
            const { cartItemId } = req.params;
            const userId = (req as AuthRequest).user;
            const cartItem = await this.cartRepository.findOne({ _id: cartItemId, userId });
            if (!cartItem) {
                res.status(404).json({ error: 'Cart item not found' });
                return;
            }
            await this.cartRepository.deleteById(cartItemId);
            res.status(200).json({
                message: 'Item removed from cart successfully'
            });
        } catch (error) {
            console.error('Error removing from cart:', error);
            res.status(500).json({ error: 'Failed to remove item from cart' });
        }
    };

    public clearCart = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = (req as AuthRequest).user;
            await Cart.deleteMany({ userId });
            res.status(200).json({
                message: 'Cart cleared successfully'
            });
        } catch (error) {
            console.error('Error clearing cart:', error);
            res.status(500).json({ error: 'Failed to clear cart' });
        }
    };

    public getUserCart = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = (req as AuthRequest).user;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10000;
            const result = await this.cartRepository.find(
                { userId },
                {
                    page,
                    limit,
                    populate: this.populationOptions,
                    sort: { createdAt: -1 }
                }
            );
            res.status(200).json({
                message: 'Cart retrieved successfully',
                cart: result,
            });
        } catch (error) {
        console.error('Error getting user cart:', error);
        res.status(500).json({ error: 'Failed to retrieve cart' });
        }
    };

    public getCartItem = async (req: Request, res: Response): Promise<void> => {
        try {
            const { cartItemId } = req.params;
            const userId = (req as AuthRequest).user;
            const cartItem = await this.cartRepository.findOne( { _id: cartItemId, userId } );
            if (!cartItem) {
                res.status(404).json({ error: 'Cart item not found' });
                return;
            }
            const populatedCartItem = await this.cartRepository.findById(
                cartItem._id.toString(),
                { populate: this.populationOptions }
            );
            res.status(200).json({
                message: 'Cart item retrieved successfully',
                cartItem: populatedCartItem
            });
        } catch (error) {
            console.error('Error getting cart item:', error);
            res.status(500).json({ error: 'Failed to retrieve cart item' });
        }
    };
}