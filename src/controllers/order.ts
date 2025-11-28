import { Request, Response } from 'express';
import { PopulateOptions } from 'mongoose';
import { BaseRepository } from '../models/base';
import { IOrder, Order, OrderProduct, Cart, ProductOption, Payment, IPayment } from '../models';
import { AuthRequest } from '../middleware/authenticateToken';
import { initializeTransaction } from '../config/initializePaystackPayment';
interface OrderProduct{
    productId: string;
    productOptionId: string;
    quantity: string;
}
export class OrderController {
    private orderRepository: BaseRepository<IOrder>;
    private paymentRepository: BaseRepository<IPayment>;
    private populationOptions: PopulateOptions[];

    constructor() {
        this.orderRepository = new BaseRepository<IOrder>(Order);
        this.paymentRepository = new BaseRepository<IPayment>(Payment);
        this.populationOptions = [
            {
                path: 'user'
            },
            {
                path: 'payments',
                populate: [
                    {
                        path: 'user',
                        select: 'firstname lastname email phone'
                    }
                ]
            },
            {
                path: 'orderProducts',
                populate: [
                    {
                        path: 'user',
                        select: 'firstname lastname email phone'
                    },
                    {
                        path: 'product',
                        populate: [
                            {
                                path: 'productCategories',
                                populate: [
                                    {
                                        path: 'category'
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        path: 'productOption',
                        populate: [
                            {
                                path: 'product'
                            }
                        ]
                    }
                ]
            }
        ];
    }

    public createOrder = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = (req as AuthRequest).user;
            const { products = [], address, state, email, phone, firstname, lastname } = req.body;
            const delivery = 0;
            const productOptionIds = products.map((p: any) => p.productOptionId);
            const productOptions = await ProductOption.find({
                _id: { $in: productOptionIds }
            }).populate('product', 'name');
            if (productOptions.length !== products.length) {
                res.status(404).json({ message: 'Some product options not found' });
                return;
            }
            const productOptionMap = new Map();
            productOptions.forEach(option => {
                productOptionMap.set(option._id.toString(), option);
            });
            let subtotal = 0;
            const validatedProducts = [];
            for (const product of products) {
                const productOption = productOptionMap.get(product.productOptionId);
                if (!productOption) {
                    res.status(404).json({ 
                        message: `Product option ${product.productOptionId} not found` 
                    });
                    return;
                }
                if (productOption.stock < product.quantity) {
                    res.status(400).json({ 
                        message: `Insufficient stock for ${productOption.name}. Available: ${productOption.stock}, Requested: ${product.quantity}` 
                    });
                    return;
                }
                const itemTotal = productOption.price * product.quantity;
                subtotal += itemTotal;
                validatedProducts.push({
                    ...product,
                    price: productOption.price,
                    itemTotal
                });
            }
            const total = subtotal + delivery;
            const orderData = { userId, total, delivery, address, state, email, phone, firstname, lastname };
            const order = await this.orderRepository.create(orderData);
            const orderProductsData = validatedProducts.map((product: any) => ({
                orderId: order.id,
                userId,
                productId: product.productId,
                productOptionId: product.productOptionId,
                quantity: product.quantity,
                price: product.price
            }));
            await OrderProduct.insertMany(orderProductsData);
            const paymentData = { orderId: order.id, userId, email: email, amount: total };
            const payment = await Payment.create(paymentData);
            const metadata = JSON.stringify({ orderId: order.id, paymentId: payment.id, email });
            const paystackRes = await initializeTransaction(email, total, metadata, `checkoutlink`);
            const { reference, authorization_url } = paystackRes.data;
            if(!reference || !authorization_url){ 
                res.status(500).json({ message: 'Error creating payment' });
                return 
            }
            await this.paymentRepository.updateById(payment.id.toString(),{ $set: { link: authorization_url, reference } },{ new: true });
            const completeOrder = await this.orderRepository.findById(
                order._id.toString(), 
                { populate: this.populationOptions }
            );
            res.status(201).json({
                message: 'Order created successfully',
                order: completeOrder,
                payment,
                summary: {
                    subtotal,
                    delivery,
                    total,
                    itemCount: products.length,
                    orderProductsData,
                }
            });
        } catch (err) {
            console.log(err);
            res.status(500).json({ message: 'Failed to create order', error: err });
        }
    };

    public getUserOrders = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = (req as AuthRequest).user;
            const { page = 1, limit = 10, status } = req.query;
            const filter: any = { userId };
            if (status) {
                filter.status = status;
            }
            const result = await this.orderRepository.find(filter, {
                page: Number(page),
                limit: Number(limit),
                sort: { createdAt: -1 },
                populate: this.populationOptions
            });
            res.status(200).json({
                message: 'Orders retrieved successfully',
                orders: result.results,
                pagination: result.pagination
            });

        } catch (err) {
            res.status(500).json({ message: 'Failed to fetch user orders', error: err });
        }
    };

    public getOrders = async (req: Request, res: Response): Promise<void> => {
        try {
            const { page = 1, limit = 20, status, userId, paymentMethod, startDate, endDate, email, firstname, lastname } = req.query;
            const filter: any = {};
            if (status) filter.status = status;
            if (userId) filter.userId = userId;
            if (email) filter.email = email;
            if (firstname) filter.firstname = firstname;
            if (lastname) filter.lastname = lastname;
            if (paymentMethod) filter.paymentMethod = paymentMethod;
            if (startDate || endDate) {
                filter.createdAt = {};
                if (startDate) filter.createdAt.$gte = new Date(startDate as string);
                if (endDate) filter.createdAt.$lte = new Date(endDate as string);
            }
            const result = await this.orderRepository.find(filter, {
                page: Number(page),
                limit: Number(limit),
                sort: { createdAt: -1 },
                populate: this.populationOptions
            });
            // Use the filtered count from pagination result, which already applies the filter
            const totalOrders = result.pagination.total;
            res.status(200).json({
                message: 'Orders retrieved successfully',
                orders: result.results,
                pagination: result.pagination,
                total: totalOrders,
            });

        } catch (err) {
            res.status(500).json({ message: 'Failed to fetch orders', error: err });
        }
    };

    public getOrderById = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const order = await this.orderRepository.findById(id, {
                populate: this.populationOptions
            });
            if (!order) {
                res.status(404).json({ message: 'Order not found' });
                return;
            }
            res.status(200).json({
                message: 'Order retrieved successfully',
                order
            });
        } catch (err) {
            res.status(500).json({ message: 'Failed to fetch order', error: err });
        }
    };

    public updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const order = await this.orderRepository.updateById(id, 
                { status, updatedAt: new Date() },
                { new: true }
            );
            if (!order) {
                res.status(404).json({ message: 'Order not found' });
                return;
            }
            const updatedOrder = await this.orderRepository.findById(id, {
                populate: this.populationOptions
            });
            res.status(200).json({
                message: 'Order status updated successfully',
                order: updatedOrder
            });

        } catch (err) {
            res.status(500).json({ message: 'Failed to update order status', error: err });
        }
    };

    public getMonthlyOrders = async (req: Request, res: Response): Promise<void> => {
        try {
            const now = new Date();
            const currentYear = now.getFullYear();
            const currentMonth = now.getMonth(); // 0-11 (0 = January)
            
            // Start of current year
            const startOfYear = new Date(currentYear, 0, 1);
            // End of current month
            const endOfCurrentMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999);

            // Initialize array with 12 zeros
            const monthlyCounts = new Array(12).fill(0);

            // Aggregate orders by month
            const monthlyOrders = await Order.aggregate([
                {
                    $match: {
                        createdAt: {
                            $gte: startOfYear,
                            $lte: endOfCurrentMonth
                        }
                    }
                },
                {
                    $group: {
                        _id: { $month: '$createdAt' },
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: { _id: 1 }
                }
            ]);

            // Fill in the counts for months that have orders
            monthlyOrders.forEach((item: { _id: number; count: number }) => {
                // MongoDB $month returns 1-12, array index is 0-11
                monthlyCounts[item._id - 1] = item.count;
            });

            res.status(200).json({
                message: 'Monthly orders retrieved successfully',
                monthlyOrders: monthlyCounts
            });

        } catch (err) {
            res.status(500).json({ message: 'Failed to fetch monthly orders', error: err });
        }
    };
}