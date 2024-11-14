import { Request, Response, NextFunction } from 'express';

const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  next();
};

export default securityHeaders; 