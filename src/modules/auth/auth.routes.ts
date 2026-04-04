import { Router } from 'express';
import { authController } from './auth.controller';
import { validate } from '../../common/middleware/validate';
import { loginSchema } from './auth.schema';

const router = Router();

router.post('/login', validate(loginSchema), (req, res, next) => authController.login(req, res, next));

export default router;
