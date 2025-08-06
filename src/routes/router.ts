import { Router } from 'express';
import swagger from './swagger'
import product from './product';
import location from './location';
import admin from './admin';
import categories from './categories';
import users from './users';
import apikey from './apikey';

const router = Router();

router.use('/admins', admin);
router.use('/categories', categories);
router.use('/users', users);
router.use('/products', product);
router.use('/locations', location);
router.use('/keys', apikey);
router.use('/', swagger);

export default router;
