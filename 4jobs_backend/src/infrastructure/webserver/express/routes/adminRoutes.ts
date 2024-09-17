import { Router } from 'express';
import { AdminController } from '../controllers/AdminController';
import { authorizeAdmin,authenticate } from '../middlewares/authMiddleware';
import { adminMiddleware } from '../middlewares/adminMiddleware';

const adminRouter = Router();

adminRouter.post('/login', AdminController.login);
adminRouter.get('/dashboard', authenticate,authorizeAdmin, adminMiddleware, AdminController.dashboard);
adminRouter.get('/recruiters', AdminController.fetchRecruiters);
adminRouter.patch('/recruiters/:id/approve', AdminController.approveRecruiter);
export {adminRouter} ;
