import { injectable, inject } from "inversify";
import TYPES from "../../../types";
import { IUserRepository } from "../../../domain/interfaces/repositories/user/IUserRepository";
import { IAuthService } from "../../../domain/interfaces/services/IAuthService";

@injectable()
export class LoginUseCase {
  constructor(
    @inject(TYPES.IUserRepository) private userRepository: IUserRepository,
    @inject(TYPES.IAuthService) private authService: IAuthService
  ) {}

  async execute(email: string, password: string, isGoogleAuth = false) {
    if (!isGoogleAuth) {
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        throw new Error("User not found");
      }
      console.log("user login", user);
      console.log("passsss",password)

      if (user.isBlocked) {
        throw new Error("User is blocked");
      }

      const isPasswordValid = await this.authService.comparePasswords(
        password,
        user.password
      );
      if (!isPasswordValid) {
        throw new Error("Invalid password");
      }

      const token = this.authService.generateToken(user);
      console.log("user", user);
      return { user, token };
    } else {
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        throw new Error("User not found");
      }

      const token = this.authService.generateToken(user);
      return { user, token };
    }
  }
}
