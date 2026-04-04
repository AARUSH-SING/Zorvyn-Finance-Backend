import { Router } from 'express';
import { dashboardController } from './dashboard.controller';
import { authenticate } from '../../common/middleware/auth';

const router = Router();

// All authenticated users can view dashboard
router.use(authenticate);

router.get('/summary', (req, res, next) => dashboardController.summary(req, res, next));
router.get('/category-breakdown', (req, res, next) => dashboardController.categoryBreakdown(req, res, next));
router.get('/recent-activity', (req, res, next) => dashboardController.recentActivity(req, res, next));
router.get('/trends', (req, res, next) => dashboardController.trends(req, res, next));

export default router;
