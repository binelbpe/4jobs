import { Request, Response } from "express";
import { injectable, inject } from "inversify";
import TYPES from "../../../types";
import { RegisterRecruiterUseCase } from "../../../application/usecases/recruiter/RegisterRecruiterUsecase";
import { LoginRecruiterUseCase } from "../../../application/usecases/recruiter/LoginRecruiterUseCase";
import { UpdateRecruiterUseCase } from "../../../application/usecases/recruiter/UpdateRecruiterUseCase";
import { GetRecruiterProfileUseCase } from "../../../application/usecases/recruiter/GetRecruiterProfileUseCase";
import { IRecruiterRepository } from "../../../domain/interfaces/repositories/recruiter/IRecruiterRepository";
import { OtpService } from "../../../infrastructure/services/OtpService";
import { S3Service } from "../../../infrastructure/services/S3Service";
import { IRecruiter } from "../../../domain/entities/Recruiter";
import { SearchUsersUseCase } from "../../../application/usecases/recruiter/SearchUsersUseCase";
import { UserSearchResult } from "../../../domain/entities/UserSearchResult";
import { JwtAuthService } from "../../../infrastructure/services/JwtAuthService";
import { User } from "../../../domain/entities/User";

const tempRecruiterStore: {
  [email: string]: {
    email: string;
    password: string;
    companyName: string;
    phone: string;
    name: string;
    governmentId?: string;
  };
} = {};

@injectable()
export class RecruiterController {
  constructor(
    @inject(TYPES.RegisterRecruiterUseCase)
    private registerUseCase: RegisterRecruiterUseCase,
    @inject(TYPES.LoginRecruiterUseCase)
    private loginUseCase: LoginRecruiterUseCase,
    @inject(TYPES.UpdateRecruiterUseCase)
    private updateRecruiterUseCase: UpdateRecruiterUseCase,
    @inject(TYPES.GetRecruiterProfileUseCase)
    private getRecruiterProfileUseCase: GetRecruiterProfileUseCase,
    @inject(TYPES.OtpService) private otpService: OtpService,
    @inject(TYPES.IRecruiterRepository)
    private recruiterRepository: IRecruiterRepository,
    @inject(TYPES.S3Service) private s3Service: S3Service,
    @inject(TYPES.SearchUsersUseCase)
    private searchUsersUseCase: SearchUsersUseCase,
    @inject(TYPES.JwtAuthService) private jwtAuthService: JwtAuthService
  ) {}

  async registerRecruiter(req: Request, res: Response) {
    try {
      const { email, password, companyName, phone, name } = req.body;
      const governmentIdFile = req.file;
      console.log("governmentId", req.file);
      if (
        !email ||
        !password ||
        !companyName ||
        !phone ||
        !name ||
        !governmentIdFile
      ) {
        return res
          .status(400)
          .json({ error: "All fields are required, including government ID" });
      }

      const existingRecruiter =
        await this.recruiterRepository.findRecruiterByEmail(email);
      if (existingRecruiter) {
        return res.status(400).json({ error: "Recruiter already exists" });
      }

      const governmentIdUrl = await this.s3Service.uploadFile(governmentIdFile);

      tempRecruiterStore[email] = {
        email,
        password,
        companyName,
        phone,
        name,
        governmentId: governmentIdUrl,
      };

      const otp = this.otpService.generateOtp();
      this.otpService.storeOtp(email, otp);
      await this.otpService.sendOtp(email, otp);

      res.status(200).json({
        message:
          "OTP sent to email. Please verify OTP to complete registration.",
      });
    } catch (error) {
      console.error("Error during recruiter registration:", error);
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
          return res.status(400).json({
            error: "Recruiter data not found. Please register again.",
          });
        }

        const result = await this.registerUseCase.execute(
          recruiterData.email,
          recruiterData.password,
          recruiterData.companyName,
          recruiterData.phone,
          recruiterData.name,
          recruiterData.governmentId || ""
        );

        delete tempRecruiterStore[email];

        res.status(201).json(result);
      } else {
        res.status(400).json({ error: "Invalid OTP" });
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      res.status(500).json({ error: "Failed to verify OTP" });
    }
  }

  async loginRecruiter(req: Request, res: Response) {
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
      console.error("Error during recruiter login:", error);
      res.status(400).json({ error: (error as Error).message });
    }
  }

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

  async getProfile(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const recruiter = await this.getRecruiterProfileUseCase.execute(id); // Updated

      if (!recruiter) {
        return res.status(404).json({ error: "Recruiter not found" });
      }

      res.status(200).json(recruiter);
    } catch (error) {
      console.error("Error fetching recruiter profile:", error);
      res.status(500).json({ error: "Failed to fetch profile" });
    }
  }

  async updateProfile(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updates: Partial<IRecruiter> = req.body;

      const governmentIdFile = req.files?.["governmentId"]?.[0];
      const employeeIdFile = req.files?.["employeeIdImage"]?.[0];

      if (governmentIdFile) {
        const governmentIdUrl = await this.s3Service.uploadFile(
          governmentIdFile
        );
        updates.governmentId = governmentIdUrl;
      }
      if (employeeIdFile) {
        const employeeIdUrl = await this.s3Service.uploadFile(employeeIdFile);
        updates.employeeIdImage = employeeIdUrl;
      }

      const updatedRecruiter = await this.updateRecruiterUseCase.execute(
        id,
        updates
      );
      if (!updatedRecruiter) {
        return res.status(404).json({ error: "Recruiter not found" });
      }

      res.status(200).json(updatedRecruiter);
    } catch (error) {
      console.error("Error updating recruiter profile:", error);
      res.status(500).json({ error: "Failed to update profile" });
    }
  }

  async searchUsers(req: Request, res: Response) {
    try {
      const { query } = req.query;
      if (typeof query !== "string") {
        return res.status(400).json({ error: "Invalid query parameter" });
      }
      const users: UserSearchResult[] = await this.searchUsersUseCase.execute(
        query
      );
      res.status(200).json(users);
    } catch (error) {
      console.error("Error searching users:", error);
      res.status(500).json({ error: "Failed to search users" });
    }
  }

  async refreshRecruiterToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;
      const decoded = this.jwtAuthService.verifyToken(refreshToken);
      const recruiter = await this.recruiterRepository.findById(decoded.id);
      if (!recruiter) {
        return res.status(404).json({ error: 'Recruiter not found' });
      }
      const newToken = this.jwtAuthService.generateToken(recruiter as unknown as User);
      res.json({ token: newToken, recruiter });
    } catch (error) {
      console.error('Error refreshing recruiter token:', error);
      res.status(401).json({ error: 'Invalid refresh token' });
    }
  }
}
