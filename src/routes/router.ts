import { Router } from 'express';
import swagger from './swagger'
import users from './users'
const router = Router();

router.use('/users', users);
router.use('/', swagger);

export default router;
