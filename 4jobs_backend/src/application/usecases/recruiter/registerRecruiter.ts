import { IRecruiterRepository } from '../../../domain/interfaces/repositories/IRecruiterRepository';
import { IRecruiter } from '../../../types/recruiter';
import { JwtAuthService } from '../../../infrastructure/services/JwtAuthService';
import { injectable, inject } from 'inversify';
import TYPES from '../../../types';

@injectable()
export class RegisterRecruiterUseCase {
  constructor(
    @inject(TYPES.IRecruiterRepository) private recruiterRepository: IRecruiterRepository,
    @inject(TYPES.JwtAuthService) private authService: JwtAuthService
  ) {}

  async execute(
    email: string,
    password: string,
    companyName: string,
    phone: string,
    name: string,
    governmentId: string // New parameter
  ): Promise<{ recruiter: IRecruiter; token: string; isApproved: boolean }> {
    const recruiter = await this.recruiterRepository.create({
      email,
      password,
      companyName,
      phone,
      name,
      role: 'recruiter',
      isApproved: false,
      governmentId, // Save the government ID
    });

    const token = this.authService.generateToken({
      id: recruiter.id,
      email: recruiter.email,
      password: recruiter.password,
      role: recruiter.role,
      name: recruiter.name,
      isAdmin: false,
    });

    return { recruiter, token, isApproved: recruiter.isApproved };
  }
}
