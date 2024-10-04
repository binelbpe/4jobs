import { IRecruiterRepository } from "../../../domain/interfaces/repositories/recruiter/IRecruiterRepository";
import { JwtAuthService } from "../../../infrastructure/services/JwtAuthService";
import { injectable, inject } from "inversify";
import TYPES from "../../../types";

@injectable()
export class LoginRecruiterUseCase {
  constructor(
    @inject(TYPES.IRecruiterRepository)
    private recruiterRepository: IRecruiterRepository,
    @inject(TYPES.JwtAuthService) private authService: JwtAuthService
  ) {}

  async execute(email: string, password: string) {

    const recruiter = await this.recruiterRepository.findRecruiterByEmail(
      email
    );

    if (!recruiter) {
      throw new Error("Invalid credentials");
    }

    const isPasswordValid = await this.authService.comparePasswords(
      password,
      recruiter.password
    );

    if (!isPasswordValid) {
      throw new Error("Invalid credentials");
    }

    const token = this.authService.generateToken({
      id: recruiter.id,
      email: recruiter.email,
      password: recruiter.password,
      role: "recruiter",
      name: recruiter.name,
      isAdmin: false,
      experiences: [],
      projects: [],
      certificates: [],
      skills: [],
    });
    return {
      isApproved: recruiter.isApproved,
      token,
      recruiter: {
        id: recruiter.id,
        email: recruiter.email,
        name: recruiter.name,
        companyName: recruiter.companyName,
        phone: recruiter.phone,
        createdAt: recruiter.createdAt,
        updatedAt: recruiter.updatedAt,
        isApproved: recruiter.isApproved,
      },
    };
  }
}
