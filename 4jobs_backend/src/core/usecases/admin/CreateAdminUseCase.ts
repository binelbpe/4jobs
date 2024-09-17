import { IUserRepository } from '../../interfaces/repositories/IUserRepository';
import { IAuthService } from '../../interfaces/services/IAuthService';
import { Admin } from '../../entities/Admin';

export class CreateAdminUseCase {
  constructor(
    private userRepository: IUserRepository,
    private authService: IAuthService
  ) {}

  async execute(email: string, password: string, name: string, adminLevel: number): Promise<Admin> {
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    const hashedPassword = await this.authService.hashPassword(password);
    const admin = await this.userRepository.create({
      email,
      password: hashedPassword,
      name,
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date(),
      isAdmin: true,
    });
    const adminUser: Admin = {
      ...admin,
      adminLevel,
    };

    await this.userRepository.update(admin.id, adminUser);

    return adminUser;
  }
}