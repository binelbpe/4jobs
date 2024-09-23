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
    governmentId: string
  ): Promise<{ recruiter: IRecruiter; token: string; isApproved: boolean }> {
    
    // Hash the password before saving
    const hashedPassword = await this.authService.hashPassword(password);
  
    const recruiter = await this.recruiterRepository.create({
      email,
      password: hashedPassword, // Save the hashed password
      companyName,
      phone,
      name,
      role: 'recruiter',
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
      experiences: [], // Provide default value
      projects: [],    // Provide default value
      certificates: [], // Provide default value
      skills: [], 
    });

    return { recruiter, token, isApproved: recruiter.isApproved };
  }
}
