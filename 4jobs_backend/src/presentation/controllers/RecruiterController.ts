import { Request, Response } from 'express';
import { injectable, inject } from 'inversify';
import TYPES from '../../types';
import { RegisterRecruiterUseCase } from '../../application/usecases/recruiter/registerRecruiter';
import { LoginRecruiterUseCase } from '../../application/usecases/recruiter/LoginRecruiterUseCase';
import { IRecruiterRepository } from '../../domain/interfaces/repositories/IRecruiterRepository';
import { OtpService } from '../../infrastructure/services/OtpService';
import { IRecruiter } from '../../types/recruiter';

const tempRecruiterStore: { [email: string]: { email: string, password: string, companyName: string, phone: string, name: string, governmentId?: string } } = {};

@injectable()
export class RecruiterController {
  constructor(
    @inject(TYPES.RegisterRecruiterUseCase) private registerUseCase: RegisterRecruiterUseCase,
    @inject(TYPES.LoginRecruiterUseCase) private loginUseCase: LoginRecruiterUseCase,
    @inject(TYPES.OtpService) private otpService: OtpService,
    @inject(TYPES.IRecruiterRepository) private recruiterRepository: IRecruiterRepository
  ) {}

  // Register Recruiter
  async registerRecruiter(req: Request, res: Response) {
    try {
      const { email, password, companyName, phone, name } = req.body;
      const governmentId = req.files?.['governmentId'] ? req.files['governmentId'][0].path : undefined;
      const employeeIdImage = req.files?.['employeeIdImage'] ? req.files['employeeIdImage'][0].path : undefined;

      if (!email || !password || !companyName || !phone || !name || !governmentId) {
        return res.status(400).json({ error: 'All fields are required, including government ID' });
      }

      const existingRecruiter = await this.recruiterRepository.findRecruiterByEmail(email);
      if (existingRecruiter) {
        return res.status(400).json({ error: 'Recruiter already exists' });
      }

      tempRecruiterStore[email] = { email, password, companyName, phone, name, governmentId };

      const otp = this.otpService.generateOtp();
      this.otpService.storeOtp(email, otp);
      await this.otpService.sendOtp(email, otp);

      res.status(200).json({ message: 'OTP sent to email. Please verify OTP to complete registration.' });
    } catch (error) {
      console.error('Error during recruiter registration:', error);
      res.status(400).json({ error: (error as Error).message });
    }
  }

  // Verify OTP
  async verifyOtp(req: Request, res: Response) {
    try {
      const { email, otp } = req.body;

      const isValid = await this.otpService.verifyOtp(email, otp);
      if (isValid) {
        const recruiterData = tempRecruiterStore[email];
        if (!recruiterData) {
          return res.status(400).json({ error: 'Recruiter data not found. Please register again.' });
        }

        const result = await this.registerUseCase.execute(
          recruiterData.email,
          recruiterData.password,
          recruiterData.companyName,
          recruiterData.phone,
          recruiterData.name,
          recruiterData.governmentId || '',
        );

        delete tempRecruiterStore[email];

        res.status(201).json(result);
      } else {
        res.status(400).json({ error: 'Invalid OTP' });
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      res.status(500).json({ error: 'Failed to verify OTP' });
    }
  }

  // Login Recruiter
  async loginRecruiter(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const result = await this.loginUseCase.execute(email, password);
      res.status(200).json(result);
    } catch (error) {
      console.error('Error during recruiter login:', error);
      res.status(400).json({ error: (error as Error).message });
    }
  }

  // Send OTP
  async sendOtp(req: Request, res: Response) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      const otp = this.otpService.generateOtp();
      this.otpService.storeOtp(email, otp);
      await this.otpService.sendOtp(email, otp);

      res.status(200).json({ message: 'OTP sent to email.' });
    } catch (error) {
      console.error('Error sending OTP:', error);
      res.status(500).json({ error: 'Failed to send OTP' });
    }
  }

  // Get Recruiter Profile
  async getProfile(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const recruiter = await this.recruiterRepository.findRecruiterById(id);
    
      if (!recruiter) {
        return res.status(404).json({ error: 'Recruiter not found' });
      }

      res.status(200).json(recruiter);
    } catch (error) {
      console.error('Error fetching recruiter profile:', error);
      res.status(500).json({ error: 'Failed to fetch profile' });
    }
  }

  // Update Recruiter Profile
  async updateProfile(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updates: Partial<IRecruiter> = req.body;

      const governmentIdImage = req.files?.['governmentId'] ? req.files['governmentId'][0].path : undefined;
      const employeeIdImage = req.files?.['employeeIdImage'] ? req.files['employeeIdImage'][0].path : undefined;

      if (governmentIdImage) {
        updates.governmentId = governmentIdImage;
      }
      if (employeeIdImage) {
        updates.employeeIdImage = employeeIdImage;
      }

      const updatedRecruiter = await this.recruiterRepository.updateRecruiter(id, updates);
console.log("updaterec",updatedRecruiter)
      if (!updatedRecruiter) {
        return res.status(404).json({ error: 'Recruiter not found' });
      }

      res.status(200).json(updatedRecruiter);
    } catch (error) {
      console.error('Error updating recruiter profile:', error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  }
}
