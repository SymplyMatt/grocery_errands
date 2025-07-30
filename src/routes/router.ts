import { Router } from 'express';
const router = Router();
import swagger from './swagger'

router.use('/', swagger);

export default router;
