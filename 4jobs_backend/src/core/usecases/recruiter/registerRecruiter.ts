import { IRecruiterRepository } from '../../interfaces/repositories/IRecruiterRepository';
import { IRecruiter } from '../../../types/recruiter';
import { JwtAuthService } from '../../../infrastructure/services/JwtAuthService';

export class RegisterRecruiterUseCase {
  constructor(
    private recruiterRepository: IRecruiterRepository,
    private authService: JwtAuthService
  ) {}

  async execute(
    email: string,
    password: string,
    companyName: string,
    phone: string,
    name: string
  ): Promise<{ recruiter: IRecruiter; token: string; isApproved: boolean }> {
    // Create recruiter logic
    const recruiter = await this.recruiterRepository.create({
      email,
      password,
      companyName,
      phone,
      name,
      role: 'recruiter',
      isApproved: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const token = this.authService.generateToken({
      id: recruiter.id,
      email: recruiter.email,
      password: recruiter.password, 
      role: recruiter.role,
      name: recruiter.name,
      createdAt: recruiter.createdAt,
      updatedAt: recruiter.updatedAt,
      isAdmin: false,
    });
    
    return { recruiter, token, isApproved: recruiter.isApproved };
  }
}
