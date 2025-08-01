import { Router } from 'express';
import swagger from './swagger'
import product from './product';
import location from './location';
const router = Router();

router.use('/products', product);
router.use('/locations', location);
router.use('/', swagger);

export default router;
