import { inject, injectable } from 'inversify';
import { Request, Response, NextFunction } from 'express';
import { IXssService } from '../../domain/interfaces/services/IXssService';
import TYPES from '../../types';
import { Container } from 'inversify';

@injectable()
export class XssMiddleware {
  constructor(
    @inject(TYPES.XssService)
    private xssService: IXssService
  ) {}

  public handle = (req: Request, res: Response, next: NextFunction) => {
    if (!req.body) {
      return next();
    }

    try {
      req.body = this.xssService.sanitize(req.body);
      next();
    } catch (error) {
      next(error);
    }
  };
}

// Create a factory function to get middleware instance
export const createXssMiddleware = (container: Container) => {
  const xssMiddleware = container.get<XssMiddleware>(XssMiddleware);
  return xssMiddleware.handle;
}; 