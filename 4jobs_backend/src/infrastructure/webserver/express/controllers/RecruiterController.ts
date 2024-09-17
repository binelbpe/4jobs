import { Request, Response } from 'express';
import { RegisterRecruiterUseCase } from '../../../../core/usecases/recruiter/registerRecruiter';
import { VerifyOtpUseCase } from '../../../../core/usecases/recruiter/VerifyOtpUseCase';
import { LoginRecruiterUseCase } from '../../../../core/usecases/recruiter/LoginRecruiterUseCase';
import { MongoRecruiterRepository } from '../../../database/mongoose/repositories/MongoRecruiterRepository';
import { JwtAuthService } from '../../../services/JwtAuthService';
import { OtpService } from '../../../services/OtpService';
import { NodemailerEmailService } from '../../../services/NodemailerEmailService';

const jwtSecret = process.env.JWT_SECRET || 'secret_1';
const recruiterRepository = new MongoRecruiterRepository();
const authService = new JwtAuthService(jwtSecret);
const emailService = new NodemailerEmailService();
const otpService = new OtpService(33 * 1000, emailService);

const tempRecruiterStore: { [email: string]: { email: string; password: string; companyName: string; phone: string; name: string } } = {};

export class RecruiterController {
  static async registerRecruiter(req: Request, res: Response) {
    try {
      const { email, password, companyName, phone, name } = req.body;

      if (!email || !password || !companyName || !phone || !name) {
        return res.status(400).json({ error: 'All fields are required' });
      }

      const existingRecruiter = await recruiterRepository.findRecruiterByEmail(email);
      if (existingRecruiter) {
        return res.status(400).json({ error: 'Recruiter already exists' });
      }

      tempRecruiterStore[email] = {
        email,
        password,
        companyName,
        phone,
        name,
      };

      const otp = otpService.generateOtp();
      otpService.storeOtp(email, otp);
      await otpService.sendOtp(email, otp);

      res.status(200).json({ message: 'OTP sent to email. Please verify OTP to complete registration.' });
    } catch (error) {
      console.error('Error during recruiter registration:', error);
      res.status(400).json({ error: (error as Error).message });
    }
  }

  static async verifyOtp(req: Request, res: Response) {
    try {
      const { email, otp } = req.body;

      const isValid = await otpService.verifyOtp(email, otp);
      if (isValid) {
        const recruiterData = tempRecruiterStore[email];
        if (!recruiterData) {
          return res.status(400).json({ error: 'Recruiter data not found. Please register again.' });
        }

        const registerUseCase = new RegisterRecruiterUseCase(recruiterRepository, authService);
        const result = await registerUseCase.execute(
          recruiterData.email,
          recruiterData.password,
          recruiterData.companyName,
          recruiterData.phone,
          recruiterData.name
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

  static async loginRecruiter(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const loginUseCase = new LoginRecruiterUseCase(recruiterRepository, authService);
      const result = await loginUseCase.execute(email, password);
      res.status(200).json(result);
    } catch (error) {
      console.error('Error during recruiter login:', error);
      res.status(400).json({ error: (error as Error).message });
    }
  }

  static async sendOtp(req: Request, res: Response) {
    try {
      const { email } = req.body;
  console.log(req.body)
      
      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }
  
      const otp = otpService.generateOtp();
      otpService.storeOtp(email, otp);
      await otpService.sendOtp(email, otp);
  
      res.status(200).json({ message: 'OTP sent to email.' });
    } catch (error) {
      console.error('Error sending OTP:', error);
      res.status(500).json({ error: 'Failed to send OTP' });
    }
  }
  
}
