import { Request, Response, NextFunction } from 'express';
import { dashboardService } from './dashboard.service';
import { sendSuccess } from '../../common/utils/response';

export class DashboardController {
  async summary(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await dashboardService.getSummary();
      sendSuccess(res, data, 'Dashboard summary retrieved');
    } catch (error) {
      next(error);
    }
  }

  async categoryBreakdown(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await dashboardService.getCategoryBreakdown();
      sendSuccess(res, data, 'Category breakdown retrieved');
    } catch (error) {
      next(error);
    }
  }

  async recentActivity(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const data = await dashboardService.getRecentActivity(limit);
      sendSuccess(res, data, 'Recent activity retrieved');
    } catch (error) {
      next(error);
    }
  }

  async trends(req: Request, res: Response, next: NextFunction) {
    try {
      const groupBy = (req.query.groupBy as 'month' | 'week') || 'month';
      const data = await dashboardService.getTrends(groupBy);
      sendSuccess(res, data, 'Trends retrieved');
    } catch (error) {
      next(error);
    }
  }
}

export const dashboardController = new DashboardController();
