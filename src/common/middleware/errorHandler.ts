import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors';

interface ValidationError extends AppError {
  errors?: { field: string; message: string }[];
}

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    const response: Record<string, unknown> = {
      success: false,
      message: err.message,
    };

    // Include validation errors if present
    const validationErr = err as ValidationError;
    if (validationErr.errors) {
      response.errors = validationErr.errors;
    }

    return res.status(err.statusCode).json(response);
  }

  console.error('Unhandled error:', err);
  return res.status(500).json({ success: false, message: 'Internal server error' });
}
