import { Router } from "express";
import { container } from "../../infrastructure/container";
import multer from "multer";
import TYPES from "../../types";
import { AuthController } from "../controllers/user/AuthController";
import { ProfileController } from "../controllers/user/ProfileController";
import { JobPostControllerUser } from "../controllers/user/JobPostControllerUser";
import { PostController } from "../controllers/user/PostController";
import { ConnectionController } from "../controllers/user/ConnectionController";
import { authenticate } from "../middlewares/authMiddleware";
import { S3Service } from "../../infrastructure/services/S3Service";
import { MessageController } from "../controllers/user/MessageController";
import { UserRecruiterMessageController } from "../controllers/user/UserRecruiterMessageController";
import { ResumeController } from "../controllers/user/ResumeController";
import { refreshTokenMiddleware } from "../middlewares/authMiddleware";

const profileController = container.get<ProfileController>(
  TYPES.ProfileController
);
const authController = container.get<AuthController>(TYPES.AuthController);
const jobPostControllerUser = container.get<JobPostControllerUser>(
  TYPES.JobPostControllerUser
);
const postController = container.get<PostController>(PostController);
const s3Service = container.get<S3Service>(TYPES.S3Service);
const connectionController = container.get<ConnectionController>(
  TYPES.ConnectionController
);
const messageController = container.get<MessageController>(
  TYPES.MessageController
);
const userRecruiterMessageController =
  container.get<UserRecruiterMessageController>(
    TYPES.UserRecruiterMessageController
  );
const resumeController = container.get<ResumeController>(
  TYPES.ResumeController
);

const storage = multer.memoryStorage();
const upload = multer({ storage });

export const authRouter = Router();

// Auth routes
authRouter.post("/login", authController.login.bind(authController));
authRouter.post("/signup", authController.signupUser.bind(authController));
authRouter.post("/send-otp", authController.sendOtp.bind(authController));
authRouter.post("/verify-otp", authController.verifyOtp.bind(authController));
authRouter.post(
  "/auth/google/callback",
  authController.googleAuth.bind(authController)
);

// Profile routes
authRouter.get(
  "/profile/:userId",
  authenticate,
  profileController.getUserProfile.bind(profileController)
);

// Update profile route
authRouter.put(
  "/edit-profile/:userId",
  authenticate,
  upload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "resume", maxCount: 1 },
  ]),
  async (req, res, next) => {
    if (req.files) {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };

      if (files["profileImage"]) {
        const profileImageUrl = await s3Service.uploadFile(
          files["profileImage"][0]
        );
        req.body.profileImage = profileImageUrl;
      }

      if (files["resume"]) {
        const resumeUrl = await s3Service.uploadFile(files["resume"][0]);
        req.body.resume = resumeUrl;
      }
    }
    next();
  },
  profileController.updateUserProfile.bind(profileController)
);

// Update projects route
authRouter.put(
  "/edit-projects/:userId",
  authenticate,
  profileController.updateUserProjects.bind(profileController)
);

// Update certificates route
authRouter.put(
  "/edit-certificates/:userId",
  authenticate,
  upload.array("certificateImage"), // Allow multiple files
  async (req, res, next) => {
    if (req.files && Array.isArray(req.files)) {
      const certificateImages = await Promise.all(
        req.files.map((file) => s3Service.uploadFile(file))
      );
      req.body.certificateImages = certificateImages;
    }

    // Parse the certificateDetails JSON string if it's a string
    if (typeof req.body.certificateDetails === "string") {
      req.body.certificateDetails = JSON.parse(req.body.certificateDetails);
    }

    // Update imageUrl with S3 URL for new uploads
    if (req.body.certificateDetails && req.body.certificateImages) {
      let s3UrlIndex = 0;
      req.body.certificateDetails = req.body.certificateDetails.map(
        (cert: any) => {
          if (cert.imageUrl.startsWith("/uploads/") || cert.imageUrl === "") {
            if (s3UrlIndex < req.body.certificateImages.length) {
              cert.imageUrl = req.body.certificateImages[s3UrlIndex];
              s3UrlIndex++;
            }
          }
          return cert;
        }
      );
    }

    console.log("req.body", req.body);
    next();
  },
  profileController.updateUserCertificates.bind(profileController)
);

// Update resume route
authRouter.put(
  "/edit-resume/:userId",
  authenticate,
  upload.single("resume"),
  async (req, res, next) => {
    if (req.file) {
      const resumeUrl = await s3Service.uploadFile(req.file);
      req.body.resume = resumeUrl;
    }
    next();
  },
  profileController.updateUserResume.bind(profileController)
);

// Job routes
authRouter.get(
  "/jobs",
  authenticate,
  jobPostControllerUser.getJobPosts.bind(jobPostControllerUser)
);
authRouter.get(
  "/jobs/:id",
  authenticate,
  jobPostControllerUser.getJobPostById.bind(jobPostControllerUser)
);
authRouter.post(
  "/jobs/:jobId/apply",
  authenticate,
  jobPostControllerUser.applyForJob.bind(jobPostControllerUser)
);
authRouter.post("/jobs/:jobId/report", authenticate, (req, res) =>
  jobPostControllerUser.reportJob(req, res)
);

// Post routes
authRouter.post(
  "/posts/:userId",
  authenticate,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "video", maxCount: 1 },
  ]),
  async (req, res, next) => {
    if (req.files) {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };

      if (files["image"]) {
        const imageUrl = await s3Service.uploadFile(files["image"][0]);
        req.body.image = imageUrl;
      }

      if (files["video"]) {
        const videoUrl = await s3Service.uploadFile(files["video"][0]);
        req.body.video = videoUrl;
      }
    }
    next();
  },
  postController.createPost.bind(postController)
);

authRouter.get(
  "/posts",
  authenticate,
  postController.getPosts.bind(postController)
);
authRouter.get(
  "/posts/user/:id",
  authenticate,
  postController.getPostsForUser.bind(postController)
);
authRouter.delete(
  "/posts/delete/:id",
  authenticate,
  postController.deletePost.bind(postController)
);
authRouter.put(
  "/posts/edit/:postId/:userId",
  authenticate,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "video", maxCount: 1 },
  ]),
  async (req, res, next) => {
    if (req.files) {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };

      if (files["image"]) {
        const imageUrl = await s3Service.uploadFile(files["image"][0]);
        req.body.imageUrl = imageUrl;
      }

      if (files["video"]) {
        const videoUrl = await s3Service.uploadFile(files["video"][0]);
        req.body.videoUrl = videoUrl;
      }
    }
    console.log("req,body", req.body);
    console.log("idsss", req.params.userId);
    next();
  },
  postController.editPost.bind(postController)
);

authRouter.get(
  "/connections/recommendations/:userId",
  authenticate,
  connectionController.getRecommendations.bind(connectionController)
);
authRouter.post(
  "/connections/request",
  authenticate,
  connectionController.sendConnectionRequest.bind(connectionController)
);
authRouter.get(
  "/notifications/:userId",
  authenticate,
  connectionController.getNotifications.bind(connectionController)
);
authRouter.get(
  "/connections/profile/:userId",
  authenticate,
  connectionController.getConnectionProfile.bind(connectionController)
);
authRouter.get(
  "/connections/requests/:userId",
  authenticate,
  connectionController.getConnectionRequests.bind(connectionController)
);

authRouter.post(
  "/connections/accept/:connectionId",
  authenticate,
  connectionController.acceptConnectionRequest.bind(connectionController)
);
authRouter.post(
  "/connections/reject/:connectionId",
  authenticate,
  connectionController.rejectConnectionRequest.bind(connectionController)
);

authRouter.get(
  "/connections/:userId",
  authenticate,
  connectionController.getConnections.bind(connectionController)
);
authRouter.get(
  "/connections/:userId/search",
  authenticate,
  connectionController.searchConnections.bind(connectionController)
);
authRouter.get(
  "/messages/conversation/:userId1/:userId2",
  authenticate,
  messageController.getConversation.bind(messageController)
);

// Connection routes for messaging
authRouter.get(
  "/connections/message/:userId",
  authenticate,
  messageController.getMessageConnections.bind(messageController)
);
authRouter.get(
  "/connections/:userId/search",
  authenticate,
  connectionController.searchMessageConnections.bind(connectionController)
);

// Message routes
authRouter.post(
  "/messages",
  authenticate,
  messageController.sendMessage.bind(messageController)
);
authRouter.get(
  "/messages/:userId1/:userId2",
  authenticate,
  messageController.getConversation.bind(messageController)
);
authRouter.put(
  "/messages/:messageId/read",
  authenticate,
  messageController.markMessageAsRead.bind(messageController)
);
authRouter.get(
  "/messages/unread/:userId",
  authenticate,
  messageController.getUnreadMessageCount.bind(messageController)
);
authRouter.get(
  "/messages/search/:userId",
  authenticate,
  messageController.searchMessages.bind(messageController)
);

// User-Recruiter Messaging routes
authRouter.get(
  "/user-conversations/:userId",
  authenticate,
  userRecruiterMessageController.getUserConversations.bind(
    userRecruiterMessageController
  )
);
authRouter.get(
  "/user-messages/:conversationId",
  authenticate,
  userRecruiterMessageController.getMessages.bind(
    userRecruiterMessageController
  )
);
authRouter.post(
  "/user-messages/:conversationId",
  authenticate,
  userRecruiterMessageController.sendMessage.bind(
    userRecruiterMessageController
  )
);
authRouter.post(
  "/user-conversations",
  authenticate,
  userRecruiterMessageController.startConversation.bind(
    userRecruiterMessageController
  )
);

// Update the resume generation route
authRouter.post("/generate-resume", authenticate, (req, res) =>
  resumeController.generateResume(req, res)
);

// Add these new routes:

// Search route (add this back)
authRouter.get(
  "/search",
  authenticate,
  authController.searchUsersAndJobs.bind(authController)
);

// Like post route
authRouter.post(
  "/posts/:postId/like",
  authenticate,
  postController.likePost.bind(postController)
);

// Dislike post route
authRouter.post(
  "/posts/:postId/dislike",
  authenticate,
  postController.dislikePost.bind(postController)
);

// Comment on post route
authRouter.post(
  "/posts/:postId/comment",
  authenticate,
  postController.commentOnPost.bind(postController)
);

// Delete comment route
authRouter.delete(
  "/posts/:postId/comments/:commentId",
  authenticate,
  postController.deleteComment.bind(postController)
);

// Add these new routes

authRouter.post(
  "/forgot-password",
  authController.sendForgotPasswordOtp.bind(authController)
);

authRouter.post(
  "/verify-forgot-password-otp",
  authController.verifyForgotPasswordOtp.bind(authController)
);

// Add this new route

authRouter.post(
  "/reset-password",
  authController.resetPassword.bind(authController)
);

// Add a new route for token refresh
authRouter.post("/refresh-token", refreshTokenMiddleware);

// Update the delete connection route to use userId and connectionId
authRouter.delete(
  "/connections/:userId/remove/:connectionId",
  authenticate,
  connectionController.deleteConnection.bind(connectionController)
);

export default authRouter;
