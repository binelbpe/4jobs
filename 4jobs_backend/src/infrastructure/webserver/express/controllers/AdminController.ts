import { Request, Response } from 'express';
import { LoginAdminUseCase } from '../../../../core/usecases/auth/LoginAdminUseCase';
import { MongoUserRepository } from '../../../database/mongoose/repositories/MongoUserRepository';
import { JwtAuthService } from '../../../services/JwtAuthService';
import { MongoRecruiterRepository } from '../../../database/mongoose/repositories/MongoRecruiterRepository'; 
const userRepository = new MongoUserRepository();
const authService = new JwtAuthService(process.env.JWT_SECRET || 'secret_1');
const recruiterRepository = new MongoRecruiterRepository(); 

export class AdminController {
  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      console.log("req.body", req.body);

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const loginUseCase = new LoginAdminUseCase(userRepository, authService);
      const result = await loginUseCase.execute(email, password);
      res.status(200).json(result);
    } catch (error) {
      console.error('Error during admin login:', error);
      res.status(400).json({ error: (error as Error).message });
    }
  }

  static async dashboard(req: Request, res: Response) {
    try {
      res.status(200).json({ message: 'Welcome to the admin dashboard!' });
    } catch (error) {
      console.error('Error during admin dashboard access:', error);
      res.status(500).json({ error: 'Failed to access admin dashboard' });
    }
  }

  static async fetchRecruiters(req: Request, res: Response) {
    try {
      const recruiters = await recruiterRepository.findRecruiters(); 
      res.status(200).json(recruiters);
    } catch (error) {
      console.error('Error fetching recruiters:', error);
      res.status(500).json({ error: 'Failed to fetch recruiters' });
    }
  }

  static async approveRecruiter(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const recruiter = await recruiterRepository.findById(id);
      if (!recruiter) {
        return res.status(404).json({ error: 'Recruiter not found' });
      }
      console.log("akathu keriittund")

      recruiter.isApproved = true;
      const updatedRecruiter = await recruiterRepository.save(recruiter);
      res.status(200).json(updatedRecruiter);
    } catch (error) {
      console.error('Error approving recruiter:', error);
      res.status(500).json({ error: 'Failed to approve recruiter' });
    }
  }
}
