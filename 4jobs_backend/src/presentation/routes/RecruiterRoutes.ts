import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { container } from '../../infrastructure/container';
import TYPES from '../../types';
import { RecruiterController } from '../controllers/RecruiterController';

const recruiterRouter = Router();
const recruiterController = container.get<RecruiterController>(TYPES.RecruiterController);

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/recruiter/');
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}${path.extname(file.originalname)}`);
    },
  }),
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|pdf|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, or PDF files are allowed.'));
    }
  },
});

// Route for registering recruiters with file uploads (governmentId and employeeIdImage)
recruiterRouter.post(
  '/register', 
  upload.fields([{ name: 'governmentId' }]), 
  recruiterController.registerRecruiter.bind(recruiterController)
);

// Route for verifying OTP
recruiterRouter.post('/verify-otp', recruiterController.verifyOtp.bind(recruiterController));

// Route for logging in
recruiterRouter.post('/login', recruiterController.loginRecruiter.bind(recruiterController));

// Route for sending OTP
recruiterRouter.post('/send-otp', recruiterController.sendOtp.bind(recruiterController));

// Route for updating recruiter profiles with optional file uploads
recruiterRouter.put(
  '/update-profile/:id', 
  upload.fields([{ name: 'governmentId' }, { name: 'employeeIdImage' }]), 
  recruiterController.updateProfile.bind(recruiterController)
);

// Route for fetching recruiter profile
recruiterRouter.get('/profile/:id', recruiterController.getProfile.bind(recruiterController));

export { recruiterRouter };
