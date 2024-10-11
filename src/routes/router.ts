import { Router } from 'express';
import swagger from './swagger'
import profiles from './profiles'
import contracts from './contracts'
const router = Router();

router.use('/profiles', profiles);
router.use('/contracts', contracts);
router.use('/', swagger);

export default router;
