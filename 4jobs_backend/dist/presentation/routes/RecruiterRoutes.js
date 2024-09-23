"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.recruiterRouter = void 0;
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const container_1 = require("../../infrastructure/container");
const types_1 = __importDefault(require("../../types"));
const recruiterRouter = (0, express_1.Router)();
exports.recruiterRouter = recruiterRouter;
const recruiterController = container_1.container.get(types_1.default.RecruiterController);
// Configure multer for file uploads
const upload = (0, multer_1.default)({
    storage: multer_1.default.diskStorage({
        destination: (req, file, cb) => {
            cb(null, 'uploads/recruiter/');
        },
        filename: (req, file, cb) => {
            cb(null, `${Date.now()}${path_1.default.extname(file.originalname)}`);
        },
    }),
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|pdf|webp/;
        const extname = filetypes.test(path_1.default.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        }
        else {
            cb(new Error('Only JPEG, PNG, or PDF files are allowed.'));
        }
    },
});
recruiterRouter.post('/register', upload.single('governmentId'), recruiterController.registerRecruiter.bind(recruiterController));
recruiterRouter.post('/verify-otp', recruiterController.verifyOtp.bind(recruiterController));
recruiterRouter.post('/login', recruiterController.loginRecruiter.bind(recruiterController));
recruiterRouter.post('/send-otp', recruiterController.sendOtp.bind(recruiterController));
