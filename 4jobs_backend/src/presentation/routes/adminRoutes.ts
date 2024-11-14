import { Router } from "express";
import { AdminController } from "../controllers/AdminController";
import { createAuthMiddleware } from '../middlewares/authMiddleware';
import { container } from "../../infrastructure/container";
import TYPES from "../../types";
import { adminMiddleware } from "../middlewares/adminMiddleware";

const adminController = container.get<AdminController>(TYPES.AdminController);

const adminRouter = Router();

const { authenticateadmin } = createAuthMiddleware(container);

adminRouter.post("/login", (req, res) => adminController.login(req, res));

adminRouter.get("/dashboard", authenticateadmin, (req, res) =>
  adminController.dashboard(req, res)
);
adminRouter.get("/recruiters", authenticateadmin, (req, res) =>
  adminController.fetchRecruiters(req, res)
); 
adminRouter.patch("/recruiters/:id/approve", authenticateadmin, (req, res) =>
  adminController.approveRecruiter(req, res)
); 
adminRouter.get("/users", authenticateadmin, (req, res) =>
  adminController.fetchUsers(req, res)
);
adminRouter.patch("/users/:userId/block", authenticateadmin, (req, res) =>
  adminController.blockUser(req, res)
);
adminRouter.patch("/users/:userId/unblock", authenticateadmin, (req, res) =>
  adminController.unblockUser(req, res)
);
adminRouter.get("/job-posts", authenticateadmin, (req, res) =>
  adminController.fetchJobPosts(req, res)
);
adminRouter.patch("/job-posts/:postId/block", authenticateadmin, (req, res) =>
  adminController.blockJobPost(req, res)
);
adminRouter.patch("/job-posts/:postId/unblock", authenticateadmin, (req, res) =>
  adminController.unblockJobPost(req, res)
);
adminRouter.get("/subscriptions", authenticateadmin, (req, res) =>
  adminController.getSubscriptions(req, res)
);
adminRouter.post(
  "/subscriptions/:recruiterId/cancel",
  authenticateadmin,
  (req, res) => adminController.cancelSubscription(req, res)
);
adminRouter.get("/user-posts", authenticateadmin, (req, res) =>
  adminController.getUserPosts(req, res)
);
adminRouter.post("/user-posts/:postId/toggle-block", authenticateadmin, (req, res) =>
  adminController.toggleUserPostBlock(req, res)
);

adminRouter.post('/refresh-token', adminController.refreshAdminToken.bind(adminController));

export { adminRouter };
