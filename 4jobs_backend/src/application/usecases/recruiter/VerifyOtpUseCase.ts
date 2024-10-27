import { IRecruiterRepository } from "../../../domain/interfaces/repositories/recruiter/IRecruiterRepository";
import { OtpService } from "../../../infrastructure/services/OtpService";
import { injectable } from "inversify";

@injectable()
export class VerifyOtpUseCase {
  private recruiterRepository: IRecruiterRepository;
  private otpService: OtpService;

  constructor(
    recruiterRepository: IRecruiterRepository,
    otpService: OtpService
  ) {
    this.recruiterRepository = recruiterRepository;
    this.otpService = otpService;
  }

  async execute(email: string, otp: string) {
    const verificationResult = await this.otpService.verifyOtp(email, otp);
    
    if (typeof verificationResult === "string") {
      throw new Error(verificationResult); // Handle error message from verifyOtp
    }

    const isValid = verificationResult; // This will be true or false
    if (isValid) {
      const recruiter = await this.recruiterRepository.findByEmail(email);
      if (recruiter) {
        recruiter.isApproved = true;
        await this.recruiterRepository.save(recruiter);
        return recruiter;
      } else {
        throw new Error("Recruiter not found");
      }
    } else {
      throw new Error("Invalid OTP");
    }
  }
}
