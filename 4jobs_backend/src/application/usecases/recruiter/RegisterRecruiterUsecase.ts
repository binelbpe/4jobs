import { IRecruiterRepository } from "../../../domain/interfaces/repositories/recruiter/IRecruiterRepository";
import { IRecruiter } from "../../../domain/entities/Recruiter";
import { JwtAuthService } from "../../../infrastructure/services/JwtAuthService";
import { injectable, inject } from "inversify";
import TYPES from "../../../types";

@injectable()
export class RegisterRecruiterUseCase {
  constructor(
    @inject(TYPES.IRecruiterRepository)
    private recruiterRepository: IRecruiterRepository,
    @inject(TYPES.JwtAuthService) private authService: JwtAuthService
  ) {}

  async execute(
    email: string,
    password: string,
    companyName: string,
    phone: string,
    name: string,
    governmentId: string
  ): Promise<{ recruiter: IRecruiter; token: string; isApproved: boolean }> {
    
    const hashedPassword = await this.authService.hashPassword(password);

    const recruiter = await this.recruiterRepository.create({
      email,
      password: hashedPassword,
      companyName,
      phone,
      name,
      role: "recruiter",
      isApproved: false,
      governmentId,
    });
    const token = this.authService.generateToken({
      id: recruiter.id,
      email: recruiter.email,
      password: recruiter.password,
      role: recruiter.role,
      name: recruiter.name,
      isAdmin: false,
      experiences: [], 
      projects: [], 
      certificates: [], 
      skills: [],
    });

    return { recruiter, token, isApproved: recruiter.isApproved };
  }
}
