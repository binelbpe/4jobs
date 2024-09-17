import { IUserRepository } from '../../interfaces/repositories/IUserRepository';
import { IAuthService } from '../../interfaces/services/IAuthService';

export class LoginUseCase {
  constructor(
    private userRepository: IUserRepository,
    private authService: IAuthService
  ) {}

  async execute(email: string, password: string, isGoogleAuth = false) {
    if (!isGoogleAuth) {
      // Regular login
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        throw new Error('User not found');
      }

      const isPasswordValid = await this.authService.comparePasswords(password, user.password);
      if (!isPasswordValid) {
        throw new Error('Invalid password');
      }

      const token = this.authService.generateToken(user);
      return { user, token };
    } else {
      // Google login
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        throw new Error('User not found');
      }

      const token = this.authService.generateToken(user);
      return { user, token };
    }
  }
}
