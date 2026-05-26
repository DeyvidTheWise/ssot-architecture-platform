import { Router } from 'express';
import { authRoutes } from './modules/auth/auth.routes';
import { okResponse } from './utils/api-response';

const router = Router();

router.get('/health', (_req, res) => {
  res.status(200).json(okResponse({ status: 'ok' }, 'Service is healthy'));
});

router.use('/auth', authRoutes);

export const apiRoutes = router;
