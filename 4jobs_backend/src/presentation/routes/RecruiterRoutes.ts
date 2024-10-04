import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { container } from '../../infrastructure/container';
import TYPES from '../../types';
import { RecruiterController } from '../controllers/recruiter/RecruiterController';
import { JobPostController } from '../controllers/recruiter/JobPostController';

const recruiterRouter = Router();
const recruiterController = container.get<RecruiterController>(TYPES.RecruiterController);
const jobPostController = container.get<JobPostController>(TYPES.JobPostController);


const upload = multer({
  storage: multer.memoryStorage(),
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


recruiterRouter.post(
  '/register', 
  upload.single('governmentId'), 
  recruiterController.registerRecruiter.bind(recruiterController)
);


recruiterRouter.post('/verify-otp', recruiterController.verifyOtp.bind(recruiterController));


recruiterRouter.post('/login', recruiterController.loginRecruiter.bind(recruiterController));


recruiterRouter.post('/send-otp', recruiterController.sendOtp.bind(recruiterController));


recruiterRouter.put(
  '/update-profile/:id', 
  upload.fields([{ name: 'governmentId' }, { name: 'employeeIdImage' }]), 
  recruiterController.updateProfile.bind(recruiterController)
);


recruiterRouter.get('/profile/:id', recruiterController.getProfile.bind(recruiterController));
recruiterRouter.post('/create-jobpost/:id', jobPostController.createJobPost.bind(jobPostController));
recruiterRouter.get('/job-posts/:id', jobPostController.getJobPostById.bind(jobPostController));
recruiterRouter.get('/recruiters/:recruiterId/job-posts', jobPostController.getJobPostsByRecruiterId.bind(jobPostController));
recruiterRouter.put('/update-jobpost/:id', jobPostController.updateJobPost.bind(jobPostController));
recruiterRouter.delete('/jobpost-delete/:id', jobPostController.deleteJobPost.bind(jobPostController));
recruiterRouter.get('/job-applicants/:jobId', jobPostController.getApplicantsByJobId.bind(jobPostController));
recruiterRouter.get('/applicants/:applicantId', jobPostController.getApplicantsById.bind(jobPostController));


export { recruiterRouter };
