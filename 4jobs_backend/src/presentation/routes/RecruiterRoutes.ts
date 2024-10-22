import { Router } from "express";
import multer from "multer";
import path from "path";
import { container } from "../../infrastructure/container";
import TYPES from "../../types";
import { RecruiterController } from "../controllers/recruiter/RecruiterController";
import { JobPostController } from "../controllers/recruiter/JobPostController";
import { RecruiterMessageController } from "../controllers/recruiter/RecruiterMessageController";
import { SubscriptionController } from "../controllers/recruiter/SubscriptionController";

const recruiterRouter = Router();
const recruiterController = container.get<RecruiterController>(
  TYPES.RecruiterController
);
const jobPostController = container.get<JobPostController>(
  TYPES.JobPostController
);
const recruiterMessageController = container.get<RecruiterMessageController>(
  TYPES.RecruiterMessageController
);
const subscriptionController = container.get<SubscriptionController>(
  TYPES.SubscriptionController
);

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|pdf|webp/;
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only JPEG, PNG, or PDF files are allowed."));
    }
  },
});

recruiterRouter.post(
  "/register",
  upload.single("governmentId"),
  recruiterController.registerRecruiter.bind(recruiterController)
);

recruiterRouter.post(
  "/verify-otp",
  recruiterController.verifyOtp.bind(recruiterController)
);

recruiterRouter.post(
  "/login",
  recruiterController.loginRecruiter.bind(recruiterController)
);

recruiterRouter.post(
  "/send-otp",
  recruiterController.sendOtp.bind(recruiterController)
);

recruiterRouter.put(
  "/update-profile/:id",
  upload.fields([{ name: "governmentId" }, { name: "employeeIdImage" }]),
  recruiterController.updateProfile.bind(recruiterController)
);

recruiterRouter.get(
  "/profile/:id",
  recruiterController.getProfile.bind(recruiterController)
);
recruiterRouter.post(
  "/create-jobpost/:id",
  jobPostController.createJobPost.bind(jobPostController)
);
recruiterRouter.get(
  "/job-posts/:id",
  jobPostController.getJobPostById.bind(jobPostController)
);
recruiterRouter.get(
  "/recruiters/:recruiterId/job-posts",
  jobPostController.getJobPostsByRecruiterId.bind(jobPostController)
);
recruiterRouter.put(
  "/update-jobpost/:id",
  jobPostController.updateJobPost.bind(jobPostController)
);
recruiterRouter.delete(
  "/jobpost-delete/:id",
  jobPostController.deleteJobPost.bind(jobPostController)
);
recruiterRouter.get(
  "/job-applicants/:jobId",
  jobPostController.getApplicantsByJobId.bind(jobPostController)
);
recruiterRouter.get(
  "/applicants/:applicantId",
  jobPostController.getApplicantsById.bind(jobPostController)
);

// Add new routes for messaging
recruiterRouter.get("/conversations/:recruiterId", (req, res) =>
  recruiterMessageController.getConversations(req, res)
);
recruiterRouter.get("/conversations/:conversationId/messages", (req, res) =>
  recruiterMessageController.getMessages(req, res)
);
recruiterRouter.post("/conversations/:conversationId/messages", (req, res) =>
  recruiterMessageController.sendMessage(req, res)
);
recruiterRouter.post("/conversations", (req, res) =>
  recruiterMessageController.startConversation(req, res)
);

// Add new routes for subscription
recruiterRouter.post(
  "/create-order",
  subscriptionController.createOrder.bind(subscriptionController)
);
recruiterRouter.post(
  "/verify-payment",
  subscriptionController.verifyPayment.bind(subscriptionController)
);

// Add this new route for updating subscription
recruiterRouter.put('/update-subscription/:recruiterId', subscriptionController.updateSubscription.bind(subscriptionController));

// Add this route
recruiterRouter.get('/search-users', recruiterController.searchUsers.bind(recruiterController));

// Add these new routes
recruiterRouter.get(
  "/job-details/:id",
  jobPostController.getJobDetails.bind(jobPostController)
);

recruiterRouter.get(
  "/all-job-posts",
  jobPostController.getAllJobPosts.bind(jobPostController)
);

recruiterRouter.get(
  "/filtered-applicants/:jobId",
  jobPostController.getFilteredApplicants.bind(jobPostController)
);

// Add a new route for refreshing recruiter token
recruiterRouter.post('/refresh-token', recruiterController.refreshRecruiterToken.bind(recruiterController));

export { recruiterRouter };
