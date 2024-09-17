import { Request, Response } from 'express';
import { LoginUseCase } from '../../../../core/usecases/auth/LoginUseCase';
import { SignupUserUseCase } from '../../../../core/usecases/auth/SignupUserUseCase';
import { MongoUserRepository } from '../../../database/mongoose/repositories/MongoUserRepository';
import { JwtAuthService } from '../../../services/JwtAuthService';
import { OtpService } from '../../../services/OtpService';
import { NodemailerEmailService } from '../../../services/NodemailerEmailService';
import { Secret } from 'jsonwebtoken';
import { GoogleAuthService } from '../../../services/GoogleAuthService';

const jwtSecret = process.env.JWT_SECRET||'secret_1' as Secret;
if (!jwtSecret) {
  throw new Error('JWT_SECRET environment variable is not set');
}

const userRepository = new MongoUserRepository();
const authService = new JwtAuthService(jwtSecret as Secret);

const emailService = new NodemailerEmailService();  


const otpService = new OtpService(33 * 1000, emailService); 

const tempUserStore: { [email: string]: { email: string, password: string, name: string } } = {};

const googleAuthService = new GoogleAuthService();

export class AuthController {
  static async sendOtp(req: Request, res: Response) {
    try {
      const { email } = req.body;
      
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
  static async signupUser(req: Request, res: Response) {
    try {
      const { email, password, name } = req.body;

      // Validate input
      if (!email || !password || !name) {
        return res.status(400).json({ error: 'Email, password, and name are required' });
      }
      
      const existingUser = await userRepository.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }
      
      tempUserStore[email] = { email, password, name };
      
      const otp = otpService.generateOtp();
      otpService.storeOtp(email, otp);
      await otpService.sendOtp(email, otp);

      res.status(200).json({ message: 'OTP sent to email. Please verify OTP to complete signup.' });
    } catch (error) {
      console.error('Error during user signup:', error);
      res.status(400).json({ error: (error as Error).message });
    }
  }

  static async verifyOtp(req: Request, res: Response) {
    try {
      const { email, otp } = req.body;

      // Verify OTP
      const isValid = await otpService.verifyOtp(email, otp);
      if (isValid) {
        const userData = tempUserStore[email];
        if (!userData) {
          return res.status(400).json({ error: 'User data not found. Please sign up again.' });
        }

        const signupUseCase = new SignupUserUseCase(userRepository, authService);
        const result = await signupUseCase.execute(userData.email, userData.password, userData.name);

        delete tempUserStore[email];

        res.status(201).json(result);
      } else {
        res.status(400).json({ error: 'Invalid OTP' });
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      res.status(500).json({ error: 'Failed to verify OTP' });
    }
  }
 
  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

  
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const loginUseCase = new LoginUseCase(userRepository, authService);
      const result = await loginUseCase.execute(email, password);
      res.status(200).json(result);
    } catch (error) {
      console.error('Error during login:', error);
      res.status(400).json({ error: (error as Error).message });
    }
  }
  
  static async googleAuth(req: Request, res: Response) {
    try {
      console.log('Request body:', req.body);
  
      const tokenId = req.body.googleToken;
  
      if (!tokenId) {
        return res.status(400).json({ error: 'ID Token is required' });
      }
  
      const payload = await googleAuthService.verifyToken(tokenId);
      const email = payload?.email;
      const name = payload?.name || 'Google User';
  
      if (!email) {
        return res.status(400).json({ error: 'Google authentication failed. No email found in token.' });
      }
  
      let user = await userRepository.findByEmail(email);
  
      if (user) {
     
        const loginUseCase = new LoginUseCase(userRepository, authService);
        const result = await loginUseCase.execute(email, '', true); 
        return res.status(200).json(result);
      } else {
        
        user = await userRepository.create({
          email,
          password: '', 
          name,
          role: 'user',
          createdAt: new Date(),
          updatedAt: new Date(),
          isAdmin: false,
        });
  
        const token = authService.generateToken(user);
        return res.status(201).json({ user, token });
      }
    } catch (error) {
      console.error('Error during Google authentication:', error);
      return res.status(500).json({ error: 'Failed to authenticate with Google' });
    }
  }  
}
