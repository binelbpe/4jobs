
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
      cb(null, 'uploads/');
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

recruiterRouter.post('/register', upload.single('governmentId'), recruiterController.registerRecruiter.bind(recruiterController));
recruiterRouter.post('/verify-otp', recruiterController.verifyOtp.bind(recruiterController));
recruiterRouter.post('/login', recruiterController.loginRecruiter.bind(recruiterController));
recruiterRouter.post('/send-otp', recruiterController.sendOtp.bind(recruiterController));

export { recruiterRouter };
