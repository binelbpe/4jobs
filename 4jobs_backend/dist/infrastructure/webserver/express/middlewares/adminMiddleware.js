"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminMiddleware = void 0;
const adminMiddleware = (req, res, next) => {
    const user = req.user;
    if (user && user.isAdmin) {
        next();
    }
    else {
        res.status(403).json({ error: 'Forbidden' });
    }
};
exports.adminMiddleware = adminMiddleware;
