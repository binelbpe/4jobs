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
      role: "recruiter",
      password: recruiter.password, // Include password in the token payload
      name: recruiter.name, // Include name in the token payload
    });

    return {
      token,
      recruiter: {
        id: recruiter.id,
        email: recruiter.email,
        companyName: recruiter.companyName,
        phone: recruiter.phone,
        name: recruiter.name,
        role: recruiter.role,
        isApproved: recruiter.isApproved,
        createdAt: recruiter.createdAt,
        updatedAt: recruiter.updatedAt,
        governmentId: recruiter.governmentId,
        employeeId: recruiter.employeeId,
        location: recruiter.location,
        employeeIdImage: recruiter.employeeIdImage,
        subscribed: recruiter.subscribed,
        planDuration: recruiter.planDuration,
        expiryDate: recruiter.expiryDate,
        subscriptionAmount: recruiter.subscriptionAmount,
        subscriptionStartDate: recruiter.subscriptionStartDate,
      },
    };
  }
}
