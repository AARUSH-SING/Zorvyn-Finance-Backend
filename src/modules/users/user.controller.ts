import { Request, Response, NextFunction } from 'express';
import { userService } from './user.service';
import { sendSuccess } from '../../common/utils/response';

export class UserController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.create(req.body);
      sendSuccess(res, user, 'User created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async findAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const users = await userService.findAll();
      sendSuccess(res, users, 'Users retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.findById(req.params.id as string);
      sendSuccess(res, user, 'User retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.update(req.params.id as string, req.body);
      sendSuccess(res, user, 'User updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.updateStatus(req.params.id as string, req.body);
      sendSuccess(res, user, 'User status updated successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
