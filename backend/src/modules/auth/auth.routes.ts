import { Router } from 'express';
import { login, me, register } from './auth.controller';
import { validateRequest } from '../../middleware/validate-request.middleware';
import { loginSchema, registerSchema } from './auth.validation';
import { authenticate } from '../../middleware/authenticate.middleware';

const router = Router();

router.post('/register', validateRequest(registerSchema), register);
router.post('/login', validateRequest(loginSchema), login);
router.get('/me', authenticate, me);

export const authRoutes = router;
