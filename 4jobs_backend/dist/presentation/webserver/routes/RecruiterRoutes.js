"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.recruiterRouter = void 0;
const express_1 = require("express");
const container_1 = require("../../../infrastructure/container");
const types_1 = __importDefault(require("../../../types"));
const recruiterRouter = (0, express_1.Router)();
exports.recruiterRouter = recruiterRouter;
const recruiterController = container_1.container.get(types_1.default.RecruiterController);
recruiterRouter.post('/register', recruiterController.registerRecruiter.bind(recruiterController));
recruiterRouter.post('/verify-otp', recruiterController.verifyOtp.bind(recruiterController));
recruiterRouter.post('/login', recruiterController.loginRecruiter.bind(recruiterController));
recruiterRouter.post('/send-otp', recruiterController.sendOtp.bind(recruiterController));
