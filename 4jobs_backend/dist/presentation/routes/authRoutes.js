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
const { authenticate, refreshTokenMiddleware } = (0, authMiddleware_1.createAuthMiddleware)(container_1.container);
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
exports.authRouter.post("/login", authController.login.bind(authController));
exports.authRouter.post("/signup", authController.signupUser.bind(authController));
exports.authRouter.post("/send-otp", authController.sendOtp.bind(authController));
exports.authRouter.post("/verify-otp", authController.verifyOtp.bind(authController));
exports.authRouter.post("/auth/google/callback", authController.googleAuth.bind(authController));
exports.authRouter.get("/profile/:userId", authenticate, profileController.getUserProfile.bind(profileController));
exports.authRouter.put("/edit-profile/:userId", authenticate, upload.fields([
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
exports.authRouter.put("/edit-projects/:userId", authenticate, profileController.updateUserProjects.bind(profileController));
exports.authRouter.put("/edit-certificates/:userId", authenticate, upload.array("certificateImage"), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.files && Array.isArray(req.files)) {
        const certificateImages = yield Promise.all(req.files.map((file) => s3Service.uploadFile(file)));
        req.body.certificateImages = certificateImages;
    }
    if (typeof req.body.certificateDetails === "string") {
        req.body.certificateDetails = JSON.parse(req.body.certificateDetails);
    }
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
    next();
}), profileController.updateUserCertificates.bind(profileController));
exports.authRouter.put("/edit-resume/:userId", authenticate, upload.single("resume"), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.file) {
        const resumeUrl = yield s3Service.uploadFile(req.file);
        req.body.resume = resumeUrl;
    }
    next();
}), profileController.updateUserResume.bind(profileController));
exports.authRouter.get("/jobs", authenticate, jobPostControllerUser.getJobPosts.bind(jobPostControllerUser));
exports.authRouter.get("/jobs/:id", authenticate, jobPostControllerUser.getJobPostById.bind(jobPostControllerUser));
exports.authRouter.post("/jobs/:jobId/apply", authenticate, jobPostControllerUser.applyForJob.bind(jobPostControllerUser));
exports.authRouter.post("/jobs/:jobId/report", authenticate, (req, res) => jobPostControllerUser.reportJob(req, res));
exports.authRouter.post("/posts/:userId", authenticate, upload.fields([
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
exports.authRouter.get("/posts", authenticate, postController.getPosts.bind(postController));
exports.authRouter.get("/posts/user/:id", authenticate, postController.getPostsForUser.bind(postController));
exports.authRouter.delete("/posts/delete/:id", authenticate, postController.deletePost.bind(postController));
exports.authRouter.put("/posts/edit/:postId/:userId", authenticate, upload.fields([
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
    next();
}), postController.editPost.bind(postController));
exports.authRouter.get("/connections/recommendations/:userId", authenticate, connectionController.getRecommendations.bind(connectionController));
exports.authRouter.post("/connections/request", authenticate, connectionController.sendConnectionRequest.bind(connectionController));
exports.authRouter.get("/notifications/:userId", authenticate, connectionController.getNotifications.bind(connectionController));
exports.authRouter.get("/connections/profile/:userId", authenticate, connectionController.getConnectionProfile.bind(connectionController));
exports.authRouter.get("/connections/requests/:userId", authenticate, connectionController.getConnectionRequests.bind(connectionController));
exports.authRouter.post("/connections/accept/:connectionId", authenticate, connectionController.acceptConnectionRequest.bind(connectionController));
exports.authRouter.post("/connections/reject/:connectionId", authenticate, connectionController.rejectConnectionRequest.bind(connectionController));
exports.authRouter.get("/connections/:userId", authenticate, connectionController.getConnections.bind(connectionController));
exports.authRouter.get("/connections/:userId/search", authenticate, connectionController.searchConnections.bind(connectionController));
exports.authRouter.get("/messages/conversation/:userId1/:userId2", authenticate, messageController.getConversation.bind(messageController));
exports.authRouter.get("/connections/message/:userId", authenticate, messageController.getMessageConnections.bind(messageController));
exports.authRouter.get("/connections/:userId/search", authenticate, connectionController.searchMessageConnections.bind(connectionController));
exports.authRouter.post("/messages", authenticate, messageController.sendMessage.bind(messageController));
exports.authRouter.get("/messages/:userId1/:userId2", authenticate, messageController.getConversation.bind(messageController));
exports.authRouter.put("/messages/:messageId/read", authenticate, messageController.markMessageAsRead.bind(messageController));
exports.authRouter.get("/messages/unread/:userId", authenticate, messageController.getUnreadMessageCount.bind(messageController));
exports.authRouter.get("/messages/search/:userId", authenticate, messageController.searchMessages.bind(messageController));
exports.authRouter.get("/user-conversations/:userId", authenticate, userRecruiterMessageController.getUserConversations.bind(userRecruiterMessageController));
exports.authRouter.get("/user-messages/:conversationId", authenticate, userRecruiterMessageController.getMessages.bind(userRecruiterMessageController));
exports.authRouter.post("/user-messages/:conversationId", authenticate, userRecruiterMessageController.sendMessage.bind(userRecruiterMessageController));
exports.authRouter.post("/user-conversations", authenticate, userRecruiterMessageController.startConversation.bind(userRecruiterMessageController));
exports.authRouter.post("/generate-resume", authenticate, (req, res) => resumeController.generateResume(req, res));
exports.authRouter.get("/search", authenticate, authController.searchUsersAndJobs.bind(authController));
exports.authRouter.post("/posts/:postId/like", authenticate, postController.likePost.bind(postController));
exports.authRouter.post("/posts/:postId/dislike", authenticate, postController.dislikePost.bind(postController));
exports.authRouter.post("/posts/:postId/comment", authenticate, postController.commentOnPost.bind(postController));
exports.authRouter.delete("/posts/:postId/comments/:commentId", authenticate, postController.deleteComment.bind(postController));
exports.authRouter.post("/forgot-password", authController.sendForgotPasswordOtp.bind(authController));
exports.authRouter.post("/verify-forgot-password-otp", authController.verifyForgotPasswordOtp.bind(authController));
exports.authRouter.post("/reset-password", authController.resetPassword.bind(authController));
exports.authRouter.post("/refresh-token", refreshTokenMiddleware);
exports.authRouter.delete("/connections/:userId/remove/:connectionId", authenticate, connectionController.deleteConnection.bind(connectionController));
exports.authRouter.post("/jobs/advanced-search", authenticate, jobPostControllerUser.advancedSearch.bind(jobPostControllerUser));
exports.default = exports.authRouter;
