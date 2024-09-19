import { Request, Response } from 'express';
import { injectable, inject } from 'inversify';
import TYPES from '../../types';
import { RegisterRecruiterUseCase } from '../../application/usecases/recruiter/registerRecruiter';
import { LoginRecruiterUseCase } from '../../application/usecases/recruiter/LoginRecruiterUseCase';
import { IRecruiterRepository } from '../../domain/interfaces/repositories/IRecruiterRepository';
import { OtpService } from '../../infrastructure/services/OtpService';

const tempRecruiterStore: { [email: string]: { email: string, password: string, companyName: string, phone: string, name: string, governmentId?: string } } = {};

@injectable()
export class RecruiterController {
  constructor(
    @inject(TYPES.RegisterRecruiterUseCase) private registerUseCase: RegisterRecruiterUseCase,
    @inject(TYPES.LoginRecruiterUseCase) private loginUseCase: LoginRecruiterUseCase,
    @inject(TYPES.OtpService) private otpService: OtpService,
    @inject(TYPES.IRecruiterRepository) private recruiterRepository: IRecruiterRepository
  ) {}

  async registerRecruiter(req: Request, res: Response) {
    try {
      const { email, password, companyName, phone, name } = req.body;
      const governmentId = req.file?.path; // File path of the uploaded government ID
      console.log("kerunnund");
      console.log(req.body);
      console.log(req.file);
      if (!email || !password || !companyName || !phone || !name || !governmentId) {
        return res.status(400).json({ error: 'All fields are required' });
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
          recruiterData.governmentId||"",
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
}
