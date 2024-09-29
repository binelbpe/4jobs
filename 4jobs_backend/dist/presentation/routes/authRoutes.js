"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const container_1 = require("../../infrastructure/container");
const multer_1 = __importDefault(require("multer"));
const types_1 = __importDefault(require("../../types"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const PostController_1 = require("../controllers/user/PostController");
const fileUploadMiddleware_1 = require("../middlewares/fileUploadMiddleware");
// Create necessary upload directories
const createUploadDirs = () => {
    const dirs = [
        'uploads/user/profile',
        'uploads/user/resume',
        'uploads/user/certificates',
    ];
    dirs.forEach((dir) => {
        if (!fs_1.default.existsSync(dir)) {
            fs_1.default.mkdirSync(dir, { recursive: true });
        }
    });
};
createUploadDirs();
const profileController = container_1.container.get(types_1.default.ProfileController);
const authController = container_1.container.get(types_1.default.AuthController);
const jobPostControllerUser = container_1.container.get(types_1.default.JobPostControllerUser);
const postController = container_1.container.get(PostController_1.PostController);
// Configure multer for file uploads
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        let dir = 'uploads/';
        if (file.fieldname === 'profileImage') {
            dir += 'user/profile';
        }
        else if (file.fieldname === 'resume') {
            dir += 'user/resume';
        }
        else if (file.fieldname === 'certificateImage') {
            dir += 'user/certificates';
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path_1.default.extname(file.originalname));
    },
});
const uploads = (0, multer_1.default)({ storage });
// Initialize the router
exports.authRouter = (0, express_1.Router)();
const mid = (req, res, next) => {
    console.log("req.body:", req.body);
    console.log("req.files:", req.files);
    next();
};
// Auth routes
exports.authRouter.post('/login', authController.login.bind(authController));
exports.authRouter.post('/signup', authController.signupUser.bind(authController));
exports.authRouter.post('/send-otp', authController.sendOtp.bind(authController));
exports.authRouter.post('/verify-otp', authController.verifyOtp.bind(authController));
exports.authRouter.post('/auth/google/callback', authController.googleAuth.bind(authController));
// Profile routes
exports.authRouter.get('/profile/:userId', authMiddleware_1.authenticate, profileController.getUserProfile.bind(profileController));
// Update profile route
exports.authRouter.put('/edit-profile/:userId', uploads.fields([
    { name: 'profileImage', maxCount: 1 },
    { name: 'resume', maxCount: 1 },
]), authMiddleware_1.authenticate, profileController.updateUserProfile.bind(profileController));
// Update projects route
exports.authRouter.put('/edit-projects/:userId', authMiddleware_1.authenticate, profileController.updateUserProjects.bind(profileController));
// Update certificates route
exports.authRouter.put('/edit-certificates/:userId', authMiddleware_1.authenticate, mid, uploads.fields([{ name: 'certificateImage', maxCount: 1 }]), profileController.updateUserCertificates.bind(profileController));
// Update experiences route
exports.authRouter.put('/edit-experiences/:userId', authMiddleware_1.authenticate, profileController.updateUserExperiences.bind(profileController));
// Update resume route
exports.authRouter.put('/edit-resume/:userId', authMiddleware_1.authenticate, uploads.single('resume'), profileController.updateUserResume.bind(profileController));
exports.authRouter.get('/jobs', authMiddleware_1.authenticate, jobPostControllerUser.getJobPosts.bind(jobPostControllerUser));
exports.authRouter.get('/jobs/:id', authMiddleware_1.authenticate, jobPostControllerUser.getJobPostById.bind(jobPostControllerUser));
exports.authRouter.post('/jobs/:jobId/apply', authMiddleware_1.authenticate, jobPostControllerUser.applyForJob.bind(jobPostControllerUser));
exports.authRouter.post('/posts/:userId', authMiddleware_1.authenticate, fileUploadMiddleware_1.upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'video', maxCount: 1 }
]), postController.createPost.bind(postController));
exports.authRouter.get('/posts', authMiddleware_1.authenticate, postController.getPosts.bind(postController));
exports.default = exports.authRouter;
