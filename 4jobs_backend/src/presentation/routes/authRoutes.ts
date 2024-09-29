import { Router } from 'express';
import { container } from '../../infrastructure/container';
import multer from 'multer';
import TYPES from '../../types';
import { AuthController } from '../controllers/user/AuthController';
import { ProfileController } from '../controllers/user/ProfileController';
import { JobPostControllerUser } from '../controllers/user/JobPostControllerUser';
import path from 'path';
import fs from 'fs';
import {authenticate} from '../middlewares/authMiddleware'
import  {PostController}  from '../controllers/user/PostController';
import { upload } from '../middlewares/fileUploadMiddleware';


// Create necessary upload directories
const createUploadDirs = () => {
  const dirs = [
    'uploads/user/profile',
    'uploads/user/resume',
    'uploads/user/certificates',
  ];
  dirs.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

createUploadDirs();

const profileController = container.get<ProfileController>(TYPES.ProfileController);
const authController = container.get<AuthController>(TYPES.AuthController);
const jobPostControllerUser = container.get<JobPostControllerUser>(TYPES.JobPostControllerUser);
const postController = container.get<PostController>(PostController);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let dir = 'uploads/';
    if (file.fieldname === 'profileImage') {
      dir += 'user/profile';
    } else if (file.fieldname === 'resume') {
      dir += 'user/resume';
    } else if (file.fieldname === 'certificateImage') {
      dir += 'user/certificates';
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const uploads = multer({ storage });


// Initialize the router
export const authRouter = Router();

import { Request, Response, NextFunction } from 'express';

const mid = (req: Request, res: Response, next: NextFunction) => {
  console.log("req.body:", req.body);
  console.log("req.files:", req.files);
  next();
};

// Auth routes
authRouter.post('/login', authController.login.bind(authController));
authRouter.post('/signup', authController.signupUser.bind(authController));
authRouter.post('/send-otp', authController.sendOtp.bind(authController));
authRouter.post('/verify-otp', authController.verifyOtp.bind(authController));
authRouter.post('/auth/google/callback', authController.googleAuth.bind(authController));

// Profile routes
authRouter.get('/profile/:userId',authenticate, profileController.getUserProfile.bind(profileController));

// Update profile route
authRouter.put(
  '/edit-profile/:userId',
  uploads.fields([
    { name: 'profileImage', maxCount: 1 },
    { name: 'resume', maxCount: 1 },
  ]),authenticate,
  profileController.updateUserProfile.bind(profileController)
);

// Update projects route
authRouter.put(
  '/edit-projects/:userId',authenticate,
  profileController.updateUserProjects.bind(profileController)
);

// Update certificates route
authRouter.put(
  '/edit-certificates/:userId',authenticate,
  mid,
  uploads.fields([{ name: 'certificateImage', maxCount: 1 }]),
  profileController.updateUserCertificates.bind(profileController)
);

// Update experiences route
authRouter.put(
  '/edit-experiences/:userId',authenticate,
  profileController.updateUserExperiences.bind(profileController)
);

// Update resume route
authRouter.put(
  '/edit-resume/:userId',authenticate,
  uploads.single('resume'),
  profileController.updateUserResume.bind(profileController)
);


authRouter.get('/jobs',authenticate, jobPostControllerUser.getJobPosts.bind(jobPostControllerUser));
authRouter.get('/jobs/:id',authenticate, jobPostControllerUser.getJobPostById.bind(jobPostControllerUser));
authRouter.post('/jobs/:jobId/apply',authenticate, jobPostControllerUser.applyForJob.bind(jobPostControllerUser));


authRouter.post('/posts/:userId',authenticate, upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'video', maxCount: 1 }
]), postController.createPost.bind(postController));


authRouter.get('/posts',authenticate, postController.getPosts.bind(postController));



export default authRouter;

