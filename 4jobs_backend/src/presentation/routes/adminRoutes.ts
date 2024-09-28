import { Router } from 'express';
import { AdminController } from '../controllers/AdminController';
import { authenticateadmin } from '../middlewares/authMiddleware';
import { container } from '../../infrastructure/container';
import TYPES from '../../types';
import { adminMiddleware } from '../middlewares/adminMiddleware';

// Create an instance of AdminController
const adminController = container.get<AdminController>(TYPES.AdminController);

const adminRouter = Router();

// Public route
adminRouter.post('/login', (req, res) => adminController.login(req, res));

// Protected routes
adminRouter.get('/dashboard', authenticateadmin, (req, res) => adminController.dashboard(req, res)); // Only admin users can access this route
adminRouter.get('/recruiters', authenticateadmin,(req, res) => adminController.fetchRecruiters(req, res)); // Accessible by authenticateadmind users
adminRouter.patch('/recruiters/:id/approve',authenticateadmin, (req, res) => adminController.approveRecruiter(req, res)); // Only admin users can approve recruiters
adminRouter.get('/users', authenticateadmin, (req, res) => adminController.fetchUsers(req, res));
adminRouter.patch('/users/:userId/block',authenticateadmin, (req, res) => adminController.blockUser(req, res))
adminRouter.patch('/users/:userId/unblock',authenticateadmin, (req, res) => adminController.unblockUser(req, res))
export { adminRouter };
