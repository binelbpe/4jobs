"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errorHandler = (error, req, res, next) => {
    // Log error details for debugging
    console.error('Error:', {
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        code: error.code,
        path: req.path,
        method: req.method,
        timestamp: new Date().toISOString()
    });
    // Send sanitized error response
    res.status(error.status || 500).json({
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
        code: error.code || 'INTERNAL_ERROR',
        status: error.status || 500
    });
};
exports.errorHandler = errorHandler;
