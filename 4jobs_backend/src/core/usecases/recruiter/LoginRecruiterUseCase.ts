import { IRecruiterRepository } from '../../../core/interfaces/repositories/IRecruiterRepository';
import { JwtAuthService } from '../../../infrastructure/services/JwtAuthService';

export class LoginRecruiterUseCase {
  private recruiterRepository: IRecruiterRepository;
  private authService: JwtAuthService;

  constructor(recruiterRepository: IRecruiterRepository, authService: JwtAuthService) {
    this.recruiterRepository = recruiterRepository;
    this.authService = authService;
  }

  async execute(email: string, password: string) {
    const recruiter = await this.recruiterRepository.findRecruiterByEmail(email);

    if (!recruiter || recruiter.password !== password) {
      throw new Error('Invalid credentials');
    }

    const token = this.authService.generateToken({
      id: recruiter.id,         
      email: recruiter.email,
      password: recruiter.password,
      role: 'recruiter', 
      name: recruiter.name,
      createdAt: recruiter.createdAt,
      updatedAt: recruiter.updatedAt,
      isAdmin: false
    });
    

    return {
      isApproved:recruiter.isApproved,
      token,
      recruiter: {
        id: recruiter.id,
        email: recruiter.email,
        name: recruiter.name,
        companyName: recruiter.companyName, 
        phone: recruiter.phone, 
        createdAt: recruiter.createdAt,
        updatedAt: recruiter.updatedAt,
        isApproved:recruiter.isApproved,
      },
    };
  }
}
