import { Router } from 'express';
import swagger from './swagger'
import profiles from './profiles'
const router = Router();

router.use('/profiles', profiles);
router.use('/', swagger);

export default router;
