import { Router, Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from '../config/swaggerConfig';

const router = Router();

router.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

router.get('/docs.json', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

export default router;
