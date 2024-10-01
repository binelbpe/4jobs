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
const jobPostController = container_1.container.get(types_1.default.JobPostController);
// Configure multer for file uploads
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
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
// Route for registering recruiters with file uploads (governmentId and employeeIdImage)
recruiterRouter.post('/register', upload.single('governmentId'), recruiterController.registerRecruiter.bind(recruiterController));
// Route for verifying OTP
recruiterRouter.post('/verify-otp', recruiterController.verifyOtp.bind(recruiterController));
// Route for logging in
recruiterRouter.post('/login', recruiterController.loginRecruiter.bind(recruiterController));
// Route for sending OTP
recruiterRouter.post('/send-otp', recruiterController.sendOtp.bind(recruiterController));
// Route for updating recruiter profiles with optional file uploads
recruiterRouter.put('/update-profile/:id', upload.fields([{ name: 'governmentId' }, { name: 'employeeIdImage' }]), recruiterController.updateProfile.bind(recruiterController));
// Route for fetching recruiter profile
recruiterRouter.get('/profile/:id', recruiterController.getProfile.bind(recruiterController));
recruiterRouter.post('/create-jobpost/:id', jobPostController.createJobPost.bind(jobPostController));
recruiterRouter.get('/job-posts/:id', jobPostController.getJobPostById.bind(jobPostController));
recruiterRouter.get('/recruiters/:recruiterId/job-posts', jobPostController.getJobPostsByRecruiterId.bind(jobPostController));
recruiterRouter.put('/update-jobpost/:id', jobPostController.updateJobPost.bind(jobPostController));
recruiterRouter.delete('/jobpost-delete/:id', jobPostController.deleteJobPost.bind(jobPostController));
recruiterRouter.get('/job-applicants/:jobId', jobPostController.getApplicantsByJobId.bind(jobPostController));
recruiterRouter.get('/applicants/:applicantId', jobPostController.getApplicantsById.bind(jobPostController));
