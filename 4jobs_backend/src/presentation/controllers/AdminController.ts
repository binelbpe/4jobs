import { Request, Response } from 'express';
import { LoginAdminUseCase } from '../../application/usecases/admin/LoginAdminUseCase';
import { injectable, inject } from 'inversify';
import TYPES from '../../types';
import { IRecruiterRepository } from '../../domain/interfaces/repositories/IRecruiterRepository';

@injectable()
export class AdminController {
  constructor(
    @inject(TYPES.IRecruiterRepository) private recruiterRepository: IRecruiterRepository,
    @inject(TYPES.LoginAdminUseCase) private loginAdminUseCase: LoginAdminUseCase
  ) {}

  // Login admin
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const result = await this.loginAdminUseCase.execute(email, password);
      console.log(result.token)
      res.status(200).json(result);
    } catch (error) {
      console.error('Error during admin login:', error);
      res.status(400).json({ error: (error as Error).message });
    }
  }

  // Fetch recruiters
  async fetchRecruiters(req: Request, res: Response) {
    try {
      const recruiters = await this.recruiterRepository.findRecruiters();
      console.log("ivide und tto")
      res.status(200).json(recruiters);
    } catch (error) {
      console.error('Error fetching recruiters:', error);
      res.status(500).json({ error: 'Failed to fetch recruiters' });
    }
  }

  // Approve recruiter
  async approveRecruiter(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const recruiter = await this.recruiterRepository.findById(id);
      if (!recruiter) {
        return res.status(404).json({ error: 'Recruiter not found' });
      }

      recruiter.isApproved = true;
      const updatedRecruiter = await this.recruiterRepository.save(recruiter);
      res.status(200).json(updatedRecruiter);
    } catch (error) {
      console.error('Error approving recruiter:', error);
      res.status(500).json({ error: 'Failed to approve recruiter' });
    }
  }

  // New method: Admin dashboard
  async dashboard(req: Request, res: Response) {
    try {
      // Logic for dashboard can include fetching statistics or admin-specific data
      const data = {
        message: 'Welcome to the Admin Dashboard',
        // Add any other data you need to display on the admin dashboard
      };
      res.status(200).json(data);
    } catch (error) {
      console.error('Error displaying dashboard:', error);
      res.status(500).json({ error: 'Failed to load admin dashboard' });
    }
  }
}
