"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminRouter = void 0;
const express_1 = require("express");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const container_1 = require("../../infrastructure/container");
const types_1 = __importDefault(require("../../types"));
const adminController = container_1.container.get(types_1.default.AdminController);
const adminRouter = (0, express_1.Router)();
exports.adminRouter = adminRouter;
adminRouter.post("/login", (req, res) => adminController.login(req, res));
adminRouter.get("/dashboard", authMiddleware_1.authenticateadmin, (req, res) => adminController.dashboard(req, res)); // Only admin users can access this route
adminRouter.get("/recruiters", authMiddleware_1.authenticateadmin, (req, res) => adminController.fetchRecruiters(req, res)); // Accessible by authenticateadmind users
adminRouter.patch("/recruiters/:id/approve", authMiddleware_1.authenticateadmin, (req, res) => adminController.approveRecruiter(req, res)); // Only admin users can approve recruiters
adminRouter.get("/users", authMiddleware_1.authenticateadmin, (req, res) => adminController.fetchUsers(req, res));
adminRouter.patch("/users/:userId/block", authMiddleware_1.authenticateadmin, (req, res) => adminController.blockUser(req, res));
adminRouter.patch("/users/:userId/unblock", authMiddleware_1.authenticateadmin, (req, res) => adminController.unblockUser(req, res));
adminRouter.get("/job-posts", authMiddleware_1.authenticateadmin, (req, res) => adminController.fetchJobPosts(req, res));
adminRouter.patch("/job-posts/:postId/block", authMiddleware_1.authenticateadmin, (req, res) => adminController.blockJobPost(req, res));
adminRouter.patch("/job-posts/:postId/unblock", authMiddleware_1.authenticateadmin, (req, res) => adminController.unblockJobPost(req, res));
adminRouter.get("/subscriptions", authMiddleware_1.authenticateadmin, (req, res) => adminController.getSubscriptions(req, res));
adminRouter.post("/subscriptions/:recruiterId/cancel", authMiddleware_1.authenticateadmin, (req, res) => adminController.cancelSubscription(req, res));
adminRouter.get("/user-posts", authMiddleware_1.authenticateadmin, (req, res) => adminController.getUserPosts(req, res));
adminRouter.post("/user-posts/:postId/toggle-block", authMiddleware_1.authenticateadmin, (req, res) => adminController.toggleUserPostBlock(req, res));
// Add a new route for refreshing admin token
adminRouter.post('/refresh-token', adminController.refreshAdminToken.bind(adminController));
