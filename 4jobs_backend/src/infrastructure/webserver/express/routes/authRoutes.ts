import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';

export const authRouter = Router();

authRouter.post('/login', AuthController.login);
authRouter.post('/signup', AuthController.signupUser);
authRouter.post('/send-otp', AuthController.sendOtp);
authRouter.post('/verify-otp', AuthController.verifyOtp);
authRouter.post('/auth/google/callback', AuthController.googleAuth); 
