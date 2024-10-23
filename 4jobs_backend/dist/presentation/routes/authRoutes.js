"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const container_1 = require("../../infrastructure/container");
const multer_1 = __importDefault(require("multer"));
const types_1 = __importDefault(require("../../types"));
const PostController_1 = require("../controllers/user/PostController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const authMiddleware_2 = require("../middlewares/authMiddleware");
const profileController = container_1.container.get(types_1.default.ProfileController);
const authController = container_1.container.get(types_1.default.AuthController);
const jobPostControllerUser = container_1.container.get(types_1.default.JobPostControllerUser);
const postController = container_1.container.get(PostController_1.PostController);
const s3Service = container_1.container.get(types_1.default.S3Service);
const connectionController = container_1.container.get(types_1.default.ConnectionController);
const messageController = container_1.container.get(types_1.default.MessageController);
const userRecruiterMessageController = container_1.container.get(types_1.default.UserRecruiterMessageController);
const resumeController = container_1.container.get(types_1.default.ResumeController);
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage });
exports.authRouter = (0, express_1.Router)();
// Auth routes
exports.authRouter.post("/login", authController.login.bind(authController));
exports.authRouter.post("/signup", authController.signupUser.bind(authController));
exports.authRouter.post("/send-otp", authController.sendOtp.bind(authController));
exports.authRouter.post("/verify-otp", authController.verifyOtp.bind(authController));
exports.authRouter.post("/auth/google/callback", authController.googleAuth.bind(authController));
// Profile routes
exports.authRouter.get("/profile/:userId", authMiddleware_1.authenticate, profileController.getUserProfile.bind(profileController));
// Update profile route
exports.authRouter.put("/edit-profile/:userId", authMiddleware_1.authenticate, upload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "resume", maxCount: 1 },
]), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.files) {
        const files = req.files;
        if (files["profileImage"]) {
            const profileImageUrl = yield s3Service.uploadFile(files["profileImage"][0]);
            req.body.profileImage = profileImageUrl;
        }
        if (files["resume"]) {
            const resumeUrl = yield s3Service.uploadFile(files["resume"][0]);
            req.body.resume = resumeUrl;
        }
    }
    next();
}), profileController.updateUserProfile.bind(profileController));
// Update projects route
exports.authRouter.put("/edit-projects/:userId", authMiddleware_1.authenticate, profileController.updateUserProjects.bind(profileController));
// Update certificates route
exports.authRouter.put("/edit-certificates/:userId", authMiddleware_1.authenticate, upload.array("certificateImage"), // Allow multiple files
(req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.files && Array.isArray(req.files)) {
        const certificateImages = yield Promise.all(req.files.map((file) => s3Service.uploadFile(file)));
        req.body.certificateImages = certificateImages;
    }
    // Parse the certificateDetails JSON string if it's a string
    if (typeof req.body.certificateDetails === "string") {
        req.body.certificateDetails = JSON.parse(req.body.certificateDetails);
    }
    // Update imageUrl with S3 URL for new uploads
    if (req.body.certificateDetails && req.body.certificateImages) {
        let s3UrlIndex = 0;
        req.body.certificateDetails = req.body.certificateDetails.map((cert) => {
            if (cert.imageUrl.startsWith("/uploads/") || cert.imageUrl === "") {
                if (s3UrlIndex < req.body.certificateImages.length) {
                    cert.imageUrl = req.body.certificateImages[s3UrlIndex];
                    s3UrlIndex++;
                }
            }
            return cert;
        });
    }
    console.log("req.body", req.body);
    next();
}), profileController.updateUserCertificates.bind(profileController));
// Update resume route
exports.authRouter.put("/edit-resume/:userId", authMiddleware_1.authenticate, upload.single("resume"), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.file) {
        const resumeUrl = yield s3Service.uploadFile(req.file);
        req.body.resume = resumeUrl;
    }
    next();
}), profileController.updateUserResume.bind(profileController));
// Job routes
exports.authRouter.get("/jobs", authMiddleware_1.authenticate, jobPostControllerUser.getJobPosts.bind(jobPostControllerUser));
exports.authRouter.get("/jobs/:id", authMiddleware_1.authenticate, jobPostControllerUser.getJobPostById.bind(jobPostControllerUser));
exports.authRouter.post("/jobs/:jobId/apply", authMiddleware_1.authenticate, jobPostControllerUser.applyForJob.bind(jobPostControllerUser));
exports.authRouter.post("/jobs/:jobId/report", authMiddleware_1.authenticate, (req, res) => jobPostControllerUser.reportJob(req, res));
// Post routes
exports.authRouter.post("/posts/:userId", authMiddleware_1.authenticate, upload.fields([
    { name: "image", maxCount: 1 },
    { name: "video", maxCount: 1 },
]), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.files) {
        const files = req.files;
        if (files["image"]) {
            const imageUrl = yield s3Service.uploadFile(files["image"][0]);
            req.body.image = imageUrl;
        }
        if (files["video"]) {
            const videoUrl = yield s3Service.uploadFile(files["video"][0]);
            req.body.video = videoUrl;
        }
    }
    next();
}), postController.createPost.bind(postController));
exports.authRouter.get("/posts", authMiddleware_1.authenticate, postController.getPosts.bind(postController));
exports.authRouter.get("/posts/user/:id", authMiddleware_1.authenticate, postController.getPostsForUser.bind(postController));
exports.authRouter.delete("/posts/delete/:id", authMiddleware_1.authenticate, postController.deletePost.bind(postController));
exports.authRouter.put("/posts/edit/:postId/:userId", authMiddleware_1.authenticate, upload.fields([
    { name: "image", maxCount: 1 },
    { name: "video", maxCount: 1 },
]), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.files) {
        const files = req.files;
        if (files["image"]) {
            const imageUrl = yield s3Service.uploadFile(files["image"][0]);
            req.body.imageUrl = imageUrl;
        }
        if (files["video"]) {
            const videoUrl = yield s3Service.uploadFile(files["video"][0]);
            req.body.videoUrl = videoUrl;
        }
    }
    console.log("req,body", req.body);
    console.log("idsss", req.params.userId);
    next();
}), postController.editPost.bind(postController));
exports.authRouter.get("/connections/recommendations/:userId", authMiddleware_1.authenticate, connectionController.getRecommendations.bind(connectionController));
exports.authRouter.post("/connections/request", authMiddleware_1.authenticate, connectionController.sendConnectionRequest.bind(connectionController));
exports.authRouter.get("/notifications/:userId", authMiddleware_1.authenticate, connectionController.getNotifications.bind(connectionController));
exports.authRouter.get("/connections/profile/:userId", authMiddleware_1.authenticate, connectionController.getConnectionProfile.bind(connectionController));
exports.authRouter.get("/connections/requests/:userId", authMiddleware_1.authenticate, connectionController.getConnectionRequests.bind(connectionController));
exports.authRouter.post("/connections/accept/:connectionId", authMiddleware_1.authenticate, connectionController.acceptConnectionRequest.bind(connectionController));
exports.authRouter.post("/connections/reject/:connectionId", authMiddleware_1.authenticate, connectionController.rejectConnectionRequest.bind(connectionController));
exports.authRouter.get("/connections/:userId", authMiddleware_1.authenticate, connectionController.getConnections.bind(connectionController));
exports.authRouter.get("/connections/:userId/search", authMiddleware_1.authenticate, connectionController.searchConnections.bind(connectionController));
exports.authRouter.get("/messages/conversation/:userId1/:userId2", authMiddleware_1.authenticate, messageController.getConversation.bind(messageController));
// Connection routes for messaging
exports.authRouter.get("/connections/message/:userId", authMiddleware_1.authenticate, messageController.getMessageConnections.bind(messageController));
exports.authRouter.get("/connections/:userId/search", authMiddleware_1.authenticate, connectionController.searchMessageConnections.bind(connectionController));
// Message routes
exports.authRouter.post("/messages", authMiddleware_1.authenticate, messageController.sendMessage.bind(messageController));
exports.authRouter.get("/messages/:userId1/:userId2", authMiddleware_1.authenticate, messageController.getConversation.bind(messageController));
exports.authRouter.put("/messages/:messageId/read", authMiddleware_1.authenticate, messageController.markMessageAsRead.bind(messageController));
exports.authRouter.get("/messages/unread/:userId", authMiddleware_1.authenticate, messageController.getUnreadMessageCount.bind(messageController));
exports.authRouter.get("/messages/search/:userId", authMiddleware_1.authenticate, messageController.searchMessages.bind(messageController));
// User-Recruiter Messaging routes
exports.authRouter.get("/user-conversations/:userId", authMiddleware_1.authenticate, userRecruiterMessageController.getUserConversations.bind(userRecruiterMessageController));
exports.authRouter.get("/user-messages/:conversationId", authMiddleware_1.authenticate, userRecruiterMessageController.getMessages.bind(userRecruiterMessageController));
exports.authRouter.post("/user-messages/:conversationId", authMiddleware_1.authenticate, userRecruiterMessageController.sendMessage.bind(userRecruiterMessageController));
exports.authRouter.post("/user-conversations", authMiddleware_1.authenticate, userRecruiterMessageController.startConversation.bind(userRecruiterMessageController));
// Update the resume generation route
exports.authRouter.post("/generate-resume", authMiddleware_1.authenticate, (req, res) => resumeController.generateResume(req, res));
// Add these new routes:
// Search route (add this back)
exports.authRouter.get("/search", authMiddleware_1.authenticate, authController.searchUsersAndJobs.bind(authController));
// Like post route
exports.authRouter.post("/posts/:postId/like", authMiddleware_1.authenticate, postController.likePost.bind(postController));
// Dislike post route
exports.authRouter.post("/posts/:postId/dislike", authMiddleware_1.authenticate, postController.dislikePost.bind(postController));
// Comment on post route
exports.authRouter.post("/posts/:postId/comment", authMiddleware_1.authenticate, postController.commentOnPost.bind(postController));
// Delete comment route
exports.authRouter.delete("/posts/:postId/comments/:commentId", authMiddleware_1.authenticate, postController.deleteComment.bind(postController));
// Add these new routes
exports.authRouter.post("/forgot-password", authController.sendForgotPasswordOtp.bind(authController));
exports.authRouter.post("/verify-forgot-password-otp", authController.verifyForgotPasswordOtp.bind(authController));
// Add this new route
exports.authRouter.post("/reset-password", authController.resetPassword.bind(authController));
// Add a new route for token refresh
exports.authRouter.post("/refresh-token", authMiddleware_2.refreshTokenMiddleware);
// Update the delete connection route to use userId and connectionId
exports.authRouter.delete("/connections/:userId/remove/:connectionId", authMiddleware_1.authenticate, connectionController.deleteConnection.bind(connectionController));
exports.default = exports.authRouter;
