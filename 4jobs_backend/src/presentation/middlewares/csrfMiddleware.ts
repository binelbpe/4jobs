import { doubleCsrf } from 'csrf-csrf';
import { Request, Response, NextFunction } from 'express';


const {
  generateToken,
  doubleCsrfProtection,
  validateRequest
} = doubleCsrf({
  getSecret: () => process.env.CSRF_SECRET || 'your-secret-key-minimum-32-chars-long',
  cookieName: 'x-csrf-token',
  cookieOptions: {
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    signed: true
  },
  size: 64,
  getTokenFromRequest: (req) => req.headers['x-csrf-token'] as string,
});


const attachCsrfToken = (req: Request, res: Response, next: NextFunction) => {

  const token = generateToken(req, res);

  res.setHeader('x-csrf-token', token);
  next();
};


const handleCsrfError = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err.name === 'CSRFTokenError') {
    return res.status(403).json({
      status: 'error',
      message: 'CSRF token validation failed'
    });
  }
  next(err);
};

export {
  doubleCsrfProtection,
  attachCsrfToken,
  handleCsrfError
};