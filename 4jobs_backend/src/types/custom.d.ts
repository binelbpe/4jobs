// src/types/custom.d.ts
import { Request } from 'express';

declare module 'express-serve-static-core' {
  interface Request {
    files?: {
      [fieldname: string]: Express.Multer.File[]; 
    };
  }
}
