import { Router } from 'express';
import { recordController } from './record.controller';
import { authenticate } from '../../common/middleware/auth';
import { authorize } from '../../common/middleware/authorize';
import { validate } from '../../common/middleware/validate';
import { createRecordSchema, updateRecordSchema, listRecordsQuerySchema } from './record.schema';
import { Role } from '../../common/types';

const router = Router();

router.use(authenticate);

// Read access: all roles
router.get('/', validate(listRecordsQuerySchema, 'query'), (req, res, next) => recordController.findAll(req, res, next));
router.get('/:id', (req, res, next) => recordController.findById(req, res, next));

// Write access: ADMIN only
router.post('/', authorize(Role.ADMIN), validate(createRecordSchema), (req, res, next) => recordController.create(req, res, next));
router.patch('/:id', authorize(Role.ADMIN), validate(updateRecordSchema), (req, res, next) => recordController.update(req, res, next));
router.delete('/:id', authorize(Role.ADMIN), (req, res, next) => recordController.delete(req, res, next));

export default router;
