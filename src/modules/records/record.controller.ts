import { Request, Response, NextFunction } from 'express';
import { recordService } from './record.service';
import { sendSuccess } from '../../common/utils/response';

export class RecordController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const record = await recordService.create(req.body, req.user!.userId);
      sendSuccess(res, record, 'Record created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { records, meta } = await recordService.findAll(req.query as any);
      sendSuccess(res, records, 'Records retrieved successfully', 200, meta);
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const record = await recordService.findById(req.params.id as string);
      sendSuccess(res, record, 'Record retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const record = await recordService.update(req.params.id as string, req.body, req.user!.userId);
      sendSuccess(res, record, 'Record updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await recordService.softDelete(req.params.id as string, req.user!.userId);
      sendSuccess(res, null, 'Record deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const recordController = new RecordController();
