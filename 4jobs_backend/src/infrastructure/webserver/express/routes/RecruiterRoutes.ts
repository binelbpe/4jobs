// src/routes/recruiterRoutes.ts

import { Router } from 'express';
import { RecruiterController } from '../controllers/RecruiterController';

export const recruiterRouter = Router();

recruiterRouter.post('/register', RecruiterController.registerRecruiter);
recruiterRouter.post('/verify-otp', RecruiterController.verifyOtp);
recruiterRouter.post('/login', RecruiterController.loginRecruiter);
recruiterRouter.post('/send-otp', RecruiterController.sendOtp);