"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateadmin = exports.refreshTokenMiddleware = exports.authenticate = void 0;
const JwtAuthService_1 = require("../../infrastructure/services/JwtAuthService");
const UserModel_1 = require("../../infrastructure/database/mongoose/models/UserModel"); // Adjust the path to your user model
const authService = new JwtAuthService_1.JwtAuthService(process.env.JWT_SECRET);
const authenticate = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const token = (_a = req.header('Authorization')) === null || _a === void 0 ? void 0 : _a.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    try {
        const decoded = authService.verifyToken(token);
        const user = yield UserModel_1.UserModel.findById(decoded.id).lean();
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        else if (user.isBlocked) {
            throw new Error('User is blocked');
        }
        else {
            req.user = user;
            next();
        }
    }
    catch (error) {
        console.error('Error authenticating user:', error);
        res.status(401).json({ error: 'Invalid token' });
    }
});
exports.authenticate = authenticate;
// Add a new middleware for token refresh
const refreshTokenMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const refreshToken = req.body.refreshToken;
    if (!refreshToken) {
        return res.status(400).json({ error: 'Refresh token is required' });
    }
    try {
        const decoded = authService.verifyToken(refreshToken);
        const user = yield UserModel_1.UserModel.findById(decoded.id).lean();
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const newToken = authService.generateToken({
            id: user._id.toString(),
            email: user.email,
            password: user.password,
            name: user.name,
            role: user.role,
        });
        res.json({ token: newToken, user });
    }
    catch (error) {
        console.error('Error refreshing token:', error);
        res.status(401).json({ error: 'Invalid refresh token' });
    }
});
exports.refreshTokenMiddleware = refreshTokenMiddleware;
const authenticateadmin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const token = (_a = req.header('Authorization')) === null || _a === void 0 ? void 0 : _a.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    try {
        const decoded = authService.verifyToken(token);
        const user = yield UserModel_1.UserModel.findById(decoded.id).lean();
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        else if (!user.isAdmin || user.role !== "admin") {
            return res.status(403).json({ error: 'User is not an admin' });
        }
        else {
            req.user = user;
            next();
        }
    }
    catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
});
exports.authenticateadmin = authenticateadmin;
