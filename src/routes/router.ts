import { Router } from 'express';
import swagger from './swagger'
import profiles from './profiles'
import contracts from './contracts'
import jobs from './jobs'
const router = Router();

router.use('/profiles', profiles);
router.use('/contracts', contracts);
router.use('/jobs', jobs);
router.use('/', swagger);

export default router;
