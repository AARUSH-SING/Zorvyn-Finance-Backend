import { Router } from 'express';
import { userController } from './user.controller';
import { authenticate } from '../../common/middleware/auth';
import { authorize } from '../../common/middleware/authorize';
import { validate } from '../../common/middleware/validate';
import { createUserSchema, updateUserSchema, updateStatusSchema } from './user.schema';
import { Role } from '../../common/types';

const router = Router();

// All user routes require authentication and ADMIN role
router.use(authenticate, authorize(Role.ADMIN));

router.post('/', validate(createUserSchema), (req, res, next) => userController.create(req, res, next));
router.get('/', (req, res, next) => userController.findAll(req, res, next));
router.get('/:id', (req, res, next) => userController.findById(req, res, next));
router.patch('/:id', validate(updateUserSchema), (req, res, next) => userController.update(req, res, next));
router.patch('/:id/status', validate(updateStatusSchema), (req, res, next) => userController.updateStatus(req, res, next));

export default router;
