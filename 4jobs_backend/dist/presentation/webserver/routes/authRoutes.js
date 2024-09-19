"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const container_1 = require("../../../infrastructure/container");
const types_1 = __importDefault(require("../../../types"));
exports.authRouter = (0, express_1.Router)();
const authController = container_1.container.get(types_1.default.AuthController);
exports.authRouter.post('/login', authController.login.bind(authController));
exports.authRouter.post('/signup', authController.signupUser.bind(authController));
exports.authRouter.post('/send-otp', authController.sendOtp.bind(authController));
exports.authRouter.post('/verify-otp', authController.verifyOtp.bind(authController));
exports.authRouter.post('/auth/google/callback', authController.googleAuth.bind(authController));
