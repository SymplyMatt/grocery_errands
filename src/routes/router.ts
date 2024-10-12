import { Router } from 'express';
import swagger from './swagger'
import profiles from './profiles'
import contracts from './contracts'
import balances from './balances'
import jobs from './jobs'
import admin from './admin'
const router = Router();

router.use('/profiles', profiles);
router.use('/contracts', contracts);
router.use('/jobs', jobs);
router.use('/balances', balances);
router.use('/admin', admin);
router.use('/', swagger);

export default router;
