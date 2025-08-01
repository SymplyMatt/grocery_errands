import { Router } from 'express';
import swagger from './swagger'
import product from './product';
const router = Router();

router.use('/products', product);
router.use('/', swagger);

export default router;
