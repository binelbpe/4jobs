import { Router } from 'express';
import { container } from '../../infrastructure/container';
import TYPES from '../../types';
import { AuthController } from '../controllers/AuthController';

export const authRouter = Router();

const authController = container.get<AuthController>(TYPES.AuthController);

authRouter.post('/login', authController.login.bind(authController));
authRouter.post('/signup', authController.signupUser.bind(authController));
authRouter.post('/send-otp', authController.sendOtp.bind(authController));
authRouter.post('/verify-otp', authController.verifyOtp.bind(authController));
authRouter.post('/auth/google/callback', authController.googleAuth.bind(authController));