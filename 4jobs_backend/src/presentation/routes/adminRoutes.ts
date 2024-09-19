import { Router } from 'express';
import { AdminController } from '../controllers/AdminController';
import { authenticate, authorizeAdmin } from '../middlewares/authMiddleware';
import { container } from '../../infrastructure/container';
import TYPES from '../../types';
import { adminMiddleware } from '../middlewares/adminMiddleware';

// Create an instance of AdminController
const adminController = container.get<AdminController>(TYPES.AdminController);

const adminRouter = Router();

// Public route
adminRouter.post('/login', (req, res) => adminController.login(req, res));

// Protected routes
adminRouter.get('/dashboard', authenticate,authorizeAdmin, (req, res) => adminController.dashboard(req, res)); // Only admin users can access this route
adminRouter.get('/recruiters', authenticate,authorizeAdmin,(req, res) => adminController.fetchRecruiters(req, res)); // Accessible by authenticated users
adminRouter.patch('/recruiters/:id/approve',authenticate, authorizeAdmin, (req, res) => adminController.approveRecruiter(req, res)); // Only admin users can approve recruiters

export { adminRouter };
