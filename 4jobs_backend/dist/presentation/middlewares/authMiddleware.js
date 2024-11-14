"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAuthMiddleware = exports.AuthMiddleware = void 0;
// src/interface/middlewares/authMiddleware.ts
const inversify_1 = require("inversify");
const types_1 = __importDefault(require("../../types"));
let AuthMiddleware = class AuthMiddleware {
    constructor(authService) {
        this.authService = authService;
        this.authenticate = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const token = (_a = req.header('Authorization')) === null || _a === void 0 ? void 0 : _a.replace('Bearer ', '');
            if (!token) {
                return res.status(401).json({ error: 'Authentication required' });
            }
            try {
                const decoded = this.authService.verifyToken(token);
                const user = yield this.authService.findUserById(decoded.id);
                if (!user) {
                    return res.status(404).json({ error: 'User not found' });
                }
                else if (user.isBlocked) {
                    throw new Error('User is blocked');
                }
                req.user = user;
                next();
            }
            catch (error) {
                console.error('Error authenticating user:', error);
                res.status(401).json({ error: 'Invalid token' });
            }
        });
        this.authenticateadmin = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const token = (_a = req.header('Authorization')) === null || _a === void 0 ? void 0 : _a.replace('Bearer ', '');
            if (!token) {
                return res.status(401).json({ error: 'Authentication required' });
            }
            try {
                const decoded = this.authService.verifyToken(token);
                const user = yield this.authService.findUserById(decoded.id);
                if (!user) {
                    return res.status(404).json({ error: 'User not found' });
                }
                else if (!user.isAdmin || user.role !== "admin") {
                    return res.status(403).json({ error: 'User is not an admin' });
                }
                req.user = user;
                next();
            }
            catch (error) {
                res.status(401).json({ error: 'Invalid token' });
            }
        });
        this.refreshToken = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const refreshToken = req.body.refreshToken;
            if (!refreshToken) {
                return res.status(400).json({ error: 'Refresh token is required' });
            }
            try {
                const decoded = this.authService.verifyToken(refreshToken);
                const user = yield this.authService.findUserById(decoded.id);
                if (!user) {
                    return res.status(404).json({ error: 'User not found' });
                }
                const newToken = this.authService.generateToken(user);
                res.json({ token: newToken, user });
            }
            catch (error) {
                console.error('Error refreshing token:', error);
                res.status(401).json({ error: 'Invalid refresh token' });
            }
        });
    }
};
exports.AuthMiddleware = AuthMiddleware;
exports.AuthMiddleware = AuthMiddleware = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.default.AuthMiddlewareService)),
    __metadata("design:paramtypes", [Object])
], AuthMiddleware);
// Create factory functions for middleware
const createAuthMiddleware = (container) => {
    const authMiddleware = container.get(AuthMiddleware);
    return {
        authenticate: authMiddleware.authenticate,
        authenticateadmin: authMiddleware.authenticateadmin,
        refreshTokenMiddleware: authMiddleware.refreshToken
    };
};
exports.createAuthMiddleware = createAuthMiddleware;
