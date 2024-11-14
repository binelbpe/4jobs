import { Request, Response } from 'express';
import { injectable, inject } from 'inversify';
import TYPES from '../../../types';
import { JobPostUseCase } from '../../../application/usecases/recruiter/JobPostUseCase';

@injectable()
export class JobPostController {
  constructor(
    @inject(TYPES.JobPostUseCase) private jobPostUseCase: JobPostUseCase
  ) {}


 async createJobPost(req: Request, res: Response): Promise<void> {
    try {
      const recruiterId = req.params.id; 
      const jobPostData = { ...req.body, recruiterId }; 
      const jobPost = await this.jobPostUseCase.createJobPost(jobPostData);
      res.status(201).json(jobPost);
    } catch (error) {
      console.error('Error in createJobPost:', error);
      res.status(500).json({ error: 'Failed to create job post'});
    }
  }

  async getJobPostById(req: Request, res: Response): Promise<void> {
    try {
      const jobPost = await this.jobPostUseCase.getJobPostById(req.params.id);
      if (jobPost && !jobPost.isBlock) {
        res.json(jobPost);
      } else {
        res.status(404).json({ error: 'Job post not found or blocked' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch job post' });
    }
  }

  async getJobPostsByRecruiterId(req: Request, res: Response): Promise<void> {
    try {
      const jobPosts = await this.jobPostUseCase.getJobPostsByRecruiterId(req.params.recruiterId);
      res.json(jobPosts);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch job posts' });
    }
  }

  async updateJobPost(req: Request, res: Response): Promise<void> {
    try {
      const updatedJobPost = await this.jobPostUseCase.updateJobPost(req.params.id, req.body);
      if (updatedJobPost) {
        res.json(updatedJobPost);
      } else {
        res.status(404).json({ error: 'Job post not found' });
      }
    } catch (error) {
      console.error('Error in createJobPost:', error);
      res.status(500).json({ error: 'Failed to update job post' });
    }
  }

  async deleteJobPost(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.jobPostUseCase.deleteJobPost(req.params.id);
      if (result) {
        res.status(204).send();
      } else {
        res.status(404).json({ error: 'Job post not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete job post' });
    }
  }
async getApplicantsByJobId(req: Request, res: Response): Promise<void> {
    try {
      const { jobId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const result = await this.jobPostUseCase.getApplicantsByJobId(jobId, page, limit);
      res.json(result);
    } catch (error) {
      console.error('Error in getApplicantsByJobId:', error);
      res.status(500).json({ error: 'Failed to fetch applicants' });
    }
  }


  async getApplicantsById(req: Request, res: Response): Promise<void> {
    try {
      const { applicantId } = req.params;

      const result = await this.jobPostUseCase.getApplicantsById(applicantId);
      res.json({user:result});
    } catch (error) {
      console.error('Error in getApplicantsById:', error);
      res.status(500).json({ error: 'Failed to fetch applicant' });
    }
  }

  async getJobDetails(req: Request, res: Response): Promise<void> {
    try {
      const jobPost = await this.jobPostUseCase.getJobPostById(req.params.id);
      if (jobPost && !jobPost.isBlock) {
        res.json(jobPost);
      } else {
        res.status(404).json({ error: 'Job post not found or blocked' });
      }
    } catch (error) {
      console.error('Error in getJobDetails:', error);
      res.status(500).json({ error: 'Failed to fetch job details' });
    }
  }

  async getAllJobPosts(req: Request, res: Response): Promise<void> {
    try {
      const jobPosts = await this.jobPostUseCase.getAllJobPosts();
      res.json(jobPosts);
    } catch (error) {
      console.error('Error in getAllJobPosts:', error);
      res.status(500).json({ error: 'Failed to fetch all job posts' });
    }
  }

  async getFilteredApplicants(req: Request, res: Response): Promise<void> {
    try {
      const { jobId } = req.params;
      const filteredApplicants = await this.jobPostUseCase.getFilteredApplicants(jobId);
      res.json(filteredApplicants);
    } catch (error) {
      console.error('Error in getFilteredApplicants:', error);
      res.status(500).json({ error: 'Failed to fetch filtered applicants' });
    }
  }
}
