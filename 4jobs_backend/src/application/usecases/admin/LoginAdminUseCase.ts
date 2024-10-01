import { injectable, inject } from "inversify";
import TYPES from "../../../types";
import { IUserRepository } from "../../../domain/interfaces/repositories/user/IUserRepository";
import { IAuthService } from "../../../domain/interfaces/services/IAuthService";

@injectable()
export class LoginAdminUseCase {
  constructor(
    @inject(TYPES.IUserRepository) private userRepository: IUserRepository,
    @inject(TYPES.IAuthService) private authService: IAuthService
  ) {}

  async execute(email: string, password: string) {
    const user = await this.userRepository.findByEmail(email);

    if (!user || !user.isAdmin) {
      throw new Error("Unauthorized,You are not an admin");
    }

    const isPasswordValid = await this.authService.comparePasswords(
      password,
      user.password||""
    );
    if (!isPasswordValid) {
      throw new Error("Invalid credentials");
    }

    const token = this.authService.generateToken(user);
    return { user, token };
  }
}
