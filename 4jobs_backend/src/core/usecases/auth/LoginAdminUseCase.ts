import { IUserRepository } from '../../interfaces/repositories/IUserRepository';
import { IAuthService } from '../../interfaces/services/IAuthService';

export class LoginAdminUseCase {
  constructor(
    private userRepository: IUserRepository,
    private authService: IAuthService
  ) {}

  async execute(email: string, password: string) {
    const user = await this.userRepository.findByEmail(email);

    if (!user || !user.isAdmin) {
      throw new Error('Unauthorized');
    }

    const isPasswordValid = await this.authService.comparePasswords(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    const token = this.authService.generateToken(user);
    return { user, token };
  }
}
