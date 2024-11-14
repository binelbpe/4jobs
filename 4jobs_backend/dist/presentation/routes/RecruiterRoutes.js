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
const recruiterMessageController = container_1.container.get(types_1.default.RecruiterMessageController);
const subscriptionController = container_1.container.get(types_1.default.SubscriptionController);
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
            cb(new Error("Only JPEG, PNG, or PDF files are allowed."));
        }
    },
});
recruiterRouter.post("/register", upload.single("governmentId"), recruiterController.registerRecruiter.bind(recruiterController));
recruiterRouter.post("/verify-otp", recruiterController.verifyOtp.bind(recruiterController));
recruiterRouter.post("/login", recruiterController.loginRecruiter.bind(recruiterController));
recruiterRouter.post("/send-otp", recruiterController.sendOtp.bind(recruiterController));
recruiterRouter.put("/update-profile/:id", upload.fields([{ name: "governmentId" }, { name: "employeeIdImage" }]), recruiterController.updateProfile.bind(recruiterController));
recruiterRouter.get("/profile/:id", recruiterController.getProfile.bind(recruiterController));
recruiterRouter.post("/create-jobpost/:id", jobPostController.createJobPost.bind(jobPostController));
recruiterRouter.get("/job-posts/:id", jobPostController.getJobPostById.bind(jobPostController));
recruiterRouter.get("/recruiters/:recruiterId/job-posts", jobPostController.getJobPostsByRecruiterId.bind(jobPostController));
recruiterRouter.put("/update-jobpost/:id", jobPostController.updateJobPost.bind(jobPostController));
recruiterRouter.delete("/jobpost-delete/:id", jobPostController.deleteJobPost.bind(jobPostController));
recruiterRouter.get("/job-applicants/:jobId", jobPostController.getApplicantsByJobId.bind(jobPostController));
recruiterRouter.get("/applicants/:applicantId", jobPostController.getApplicantsById.bind(jobPostController));
recruiterRouter.get("/conversations/:recruiterId", (req, res) => recruiterMessageController.getConversations(req, res));
recruiterRouter.get("/conversations/:conversationId/messages", (req, res) => recruiterMessageController.getMessages(req, res));
recruiterRouter.post("/conversations/:conversationId/messages", (req, res) => recruiterMessageController.sendMessage(req, res));
recruiterRouter.post("/conversations", (req, res) => recruiterMessageController.startConversation(req, res));
recruiterRouter.post("/create-order", subscriptionController.createOrder.bind(subscriptionController));
recruiterRouter.post("/verify-payment", subscriptionController.verifyPayment.bind(subscriptionController));
recruiterRouter.put('/update-subscription/:recruiterId', subscriptionController.updateSubscription.bind(subscriptionController));
recruiterRouter.get('/search-users', recruiterController.searchUsers.bind(recruiterController));
recruiterRouter.get("/job-details/:id", jobPostController.getJobDetails.bind(jobPostController));
recruiterRouter.get("/all-job-posts", jobPostController.getAllJobPosts.bind(jobPostController));
recruiterRouter.get("/filtered-applicants/:jobId", jobPostController.getFilteredApplicants.bind(jobPostController));
recruiterRouter.post('/refresh-token', recruiterController.refreshRecruiterToken.bind(recruiterController));
