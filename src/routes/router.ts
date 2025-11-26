import { Router } from 'express';
import swagger from './swagger'
import product from './product';
import location from './location';
import admin from './admin';
import categories from './categories';
import users from './users';
import cart from './cart';
import orders from './orders';
import auth from './auth';

const router = Router();

router.use('/admins', admin);
router.use('/categories', categories);
router.use('/cart', cart);
router.use('/users', users);
router.use('/products', product);
router.use('/locations', location);
router.use('/orders', orders);
router.use('/auth', auth);
router.use('/', swagger);

export default router;
