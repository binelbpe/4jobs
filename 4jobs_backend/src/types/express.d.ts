import { Container } from 'inversify';

declare global {
  namespace Express {
    interface Request {
      container: Container;
      file?: Express.Multer.File;
      files?: Express.Multer.File[];
    }
  }
}