import { Request, Response, NextFunction } from 'express';
import { Container } from 'inversify';

const containerMiddleware = (container: Container) => {
  return (req: any, res: Response, next: NextFunction) => {
    req.container = container;
    next();
  };
};

export default containerMiddleware; 