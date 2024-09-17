import { IUserRepository } from '../../interfaces/repositories/IUserRepository';
import { IAuthService } from '../../interfaces/services/IAuthService';

export class SignupUserUseCase {
  constructor(
    private userRepository: IUserRepository,
    private authService: IAuthService
  ) {}

  async execute(email: string, password: string, name: string, isGoogleAuth = false) {
    if (!isGoogleAuth) {
      const existingUser = await this.userRepository.findByEmail(email);
      if (existingUser) {
        throw new Error('User already exists');
      }

      const hashedPassword = await this.authService.hashPassword(password);
      const user = await this.userRepository.create({
        email,
        password: hashedPassword,
        name,
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date(),
        isAdmin:false,
      });

      const token = this.authService.generateToken(user);
      return { user, token };
    } else {
      
      let user = await this.userRepository.findByEmail(email);
      if (user) {
        return { user, token: this.authService.generateToken(user) };
      }

      user = await this.userRepository.create({
        email,
        password: "",  
        name,
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date(),
        isAdmin:false,
      });

      const token = this.authService.generateToken(user);
      return { user, token };
    }
  }
}
