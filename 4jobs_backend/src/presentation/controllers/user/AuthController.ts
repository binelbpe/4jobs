import { Request, Response } from "express";
import { injectable, inject } from "inversify";
import TYPES from "../../../types";
import { SignupUserUseCase } from "../../../application/usecases/user/SignupUserUseCase";
import { LoginUseCase } from "../../../application/usecases/user/LoginUseCase";
import { JwtAuthService } from "../../../infrastructure/services/JwtAuthService";
import { OtpService } from "../../../infrastructure/services/OtpService";
import { GoogleAuthService } from "../../../infrastructure/services/GoogleAuthService";
import { IUserRepository } from "../../../domain/interfaces/repositories/user/IUserRepository";
import { SearchUsersAndJobsUseCase } from "../../../application/usecases/user/SearchUsersAndJobsUseCase";
import { AuthenticatedRequest } from "../../../types/index";

const tempUserStore: {
  [email: string]: { email: string; password: string; name: string };
} = {};

@injectable()
export class AuthController {
  constructor(
    @inject(TYPES.SignupUserUseCase) private signupUseCase: SignupUserUseCase,
    @inject(TYPES.LoginUseCase) private loginUseCase: LoginUseCase,
    @inject(TYPES.OtpService) private otpService: OtpService,
    @inject(TYPES.IUserRepository) private userRepository: IUserRepository,
    @inject(TYPES.GoogleAuthService)
    private googleAuthService: GoogleAuthService,
    @inject(TYPES.JwtAuthService) private jwtAuthService: JwtAuthService,
    @inject(TYPES.SearchUsersAndJobsUseCase)
    private searchUsersAndJobsUseCase: SearchUsersAndJobsUseCase
  ) {}

  async sendOtp(req: Request, res: Response) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      const otp = this.otpService.generateOtp();
      this.otpService.storeOtp(email, otp);
      await this.otpService.sendOtp(email, otp);

      res.status(200).json({ message: "OTP sent to email." });
    } catch (error) {
      console.error("Error sending OTP:", error);
      res.status(500).json({ error: "Failed to send OTP" });
    }
  }

  async signupUser(req: Request, res: Response) {
    try {
      const { email, password, name } = req.body;

      if (!email || !password || !name) {
        return res
          .status(400)
          .json({ error: "Email, password, and name are required" });
      }

      const existingUser = await this.userRepository.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: "User already exists" });
      }

      tempUserStore[email] = { email, password, name };

      const otp = this.otpService.generateOtp();
      this.otpService.storeOtp(email, otp);
      await this.otpService.sendOtp(email, otp);

      res.status(200).json({
        message: "OTP sent to email. Please verify OTP to complete signup.",
      });
    } catch (error) {
      console.error("Error during user signup:", error);
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async verifyOtp(req: Request, res: Response) {
    try {
      const { email, otp } = req.body;

      const isValid = await this.otpService.verifyOtp(email, otp);
      if (isValid) {
        const userData = tempUserStore[email];
        if (!userData) {
          return res
            .status(400)
            .json({ error: "User data not found. Please sign up again." });
        }

        const result = await this.signupUseCase.execute(
          userData.email,
          userData.password,
          userData.name
        );
        delete tempUserStore[email];

        res.status(201).json(result);
      } else {
        res.status(400).json({ error: "Invalid OTP" });
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      res.status(500).json({ error: "Failed to verify OTP" });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res
          .status(400)
          .json({ error: "Email and password are required" });
      }

      const result = await this.loginUseCase.execute(email, password);
      res.status(200).json(result);
    } catch (error) {
      console.error("Error during login:", error);
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async googleAuth(req: Request, res: Response) {
    try {
      const tokenId = req.body.googleToken;

      if (!tokenId) {
        return res.status(400).json({ error: "ID Token is required" });
      }

      const payload = await this.googleAuthService.verifyToken(tokenId);
      const email = payload?.email;
      const name = payload?.name || "Google User";

      if (!email) {
        return res.status(400).json({
          error: "Google authentication failed. No email found in token.",
        });
      }

      let user = await this.userRepository.findByEmail(email);

      if (user) {
        const result = await this.loginUseCase.execute(email, "", true);
        const token = this.jwtAuthService.generateToken(user);
        return res.status(200).json(result);
      } else {
        user = await this.userRepository.create({
          email,
          password: "",
          name,
          role: "user",
          isAdmin: false,
          experiences: [],
          projects: [],
          certificates: [],
          skills: [],
          appliedJobs: [],
        });

        const token = this.jwtAuthService.generateToken(user);
        return res.status(201).json({ user, token });
      }
    } catch (error) {
      console.error("Error during Google authentication:", error);
      return res
        .status(500)
        .json({ error: "Failed to authenticate with Google" });
    }
  }

  async searchUsersAndJobs(req: AuthenticatedRequest, res: Response) {
    try {
      const { query } = req.query;
      const { userId } = req.query;


      if (typeof query !== "string" || query.length < 3 || !userId) {
        return res
          .status(400)
          .json({ error: "Invalid query or user not authenticated" });
      }

      const results = await this.searchUsersAndJobsUseCase.execute(
        query,
        userId as string
      );
      res.status(200).json(results);
    } catch (error) {
      console.error("Error searching users and jobs:", error);
      res.status(500).json({ error: "An error occurred while searching" });
    }
  }

  async sendForgotPasswordOtp(req: Request, res: Response) {
    try {
      const { email } = req.body;
      const otp = this.otpService.generateOtp();
      await this.otpService.sendForgotPasswordOtp(email, otp);
      res.status(200).json({ message: 'OTP sent for password reset' });
    } catch (error) {
      console.error('Error sending forgot password OTP:', error);
      res.status(500).json({ error: 'Failed to send OTP' });
    }
  }

  async verifyForgotPasswordOtp(req: Request, res: Response) {
    try {
      const { email, otp } = req.body;
      const isValid = await this.otpService.verifyOtp(email, otp);
      if (isValid) {
        res.status(200).json({ message: 'OTP verified successfully' });
      } else {
        res.status(400).json({ error: 'Invalid OTP' });
      }
    } catch (error) {
      console.error('Error verifying forgot password OTP:', error);
      res.status(500).json({ error: 'Failed to verify OTP' });
    }
  }

  async resetPassword(req: Request, res: Response) {
    try {
      const { email, newPassword, otp } = req.body;
      const isValidOtp = await this.otpService.verifyOtp(email, otp);
      if (!isValidOtp) {
        return res.status(400).json({ error: 'Invalid OTP' });
      }
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      const hashedPassword = await this.jwtAuthService.hashPassword(newPassword);
      await this.userRepository.updatePassword(user.id, hashedPassword);
      res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
      console.error('Error resetting password:', error);
      res.status(500).json({ error: 'Failed to reset password' });
    }
  }
}
