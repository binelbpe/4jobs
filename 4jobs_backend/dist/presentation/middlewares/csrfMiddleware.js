"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleCsrfError = exports.attachCsrfToken = exports.doubleCsrfProtection = void 0;
const csrf_csrf_1 = require("csrf-csrf");
const { generateToken, doubleCsrfProtection, validateRequest } = (0, csrf_csrf_1.doubleCsrf)({
    getSecret: () => process.env.CSRF_SECRET || 'your-secret-key-minimum-32-chars-long',
    cookieName: 'x-csrf-token',
    cookieOptions: {
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        signed: true
    },
    size: 64,
    getTokenFromRequest: (req) => req.headers['x-csrf-token'],
});
exports.doubleCsrfProtection = doubleCsrfProtection;
const attachCsrfToken = (req, res, next) => {
    const token = generateToken(req, res);
    res.setHeader('x-csrf-token', token);
    next();
};
exports.attachCsrfToken = attachCsrfToken;
const handleCsrfError = (err, req, res, next) => {
    if (err.name === 'CSRFTokenError') {
        return res.status(403).json({
            status: 'error',
            message: 'CSRF token validation failed'
        });
    }
    next(err);
};
exports.handleCsrfError = handleCsrfError;
