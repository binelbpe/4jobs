"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recruiterAuthMiddleware = recruiterAuthMiddleware;
const JwtAuthService_1 = require("../../../infrastructure/services/JwtAuthService");
const jwtSecret = process.env.JWT_SECRET || 'secret_1';
const authService = new JwtAuthService_1.JwtAuthService(jwtSecret);
function recruiterAuthMiddleware(req, res, next) {
    var _a;
    const token = (_a = req.headers['authorization']) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
        const decoded = authService.verifyToken(token);
        if (decoded && decoded.role === 'recruiter') {
            req.user = decoded;
            next();
        }
        else {
            res.status(403).json({ error: 'Forbidden' });
        }
    }
    catch (error) {
        res.status(401).json({ error: 'Unauthorized' });
    }
}
