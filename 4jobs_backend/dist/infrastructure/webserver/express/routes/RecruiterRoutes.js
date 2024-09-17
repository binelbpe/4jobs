"use strict";
// src/routes/recruiterRoutes.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.recruiterRouter = void 0;
const express_1 = require("express");
const RecruiterController_1 = require("../controllers/RecruiterController");
exports.recruiterRouter = (0, express_1.Router)();
exports.recruiterRouter.post('/register', RecruiterController_1.RecruiterController.registerRecruiter);
exports.recruiterRouter.post('/verify-otp', RecruiterController_1.RecruiterController.verifyOtp);
exports.recruiterRouter.post('/login', RecruiterController_1.RecruiterController.loginRecruiter);
exports.recruiterRouter.post('/send-otp', RecruiterController_1.RecruiterController.sendOtp);
