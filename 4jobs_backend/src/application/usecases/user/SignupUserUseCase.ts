import { inject, injectable } from "inversify";
import TYPES from "../../../types";
import { IUserRepository } from "../../../domain/interfaces/repositories/user/IUserRepository";
import { IAuthService } from "../../../domain/interfaces/services/IAuthService";

@injectable()
export class SignupUserUseCase {
  private userRepository: IUserRepository;
  private authService: IAuthService;

  constructor(
    @inject(TYPES.IUserRepository) userRepository: IUserRepository,
    @inject(TYPES.IAuthService) authService: IAuthService
  ) {
    this.userRepository = userRepository;
    this.authService = authService;
  }

  async execute(
    email: string,
    password: string,
    name: string,
    isGoogleAuth = false
  ) {
    if (!isGoogleAuth) {
      const existingUser = await this.userRepository.findByEmail(email);
      if (existingUser) {
        throw new Error("User already exists");
      }

  
      const hashedPassword = await this.authService.hashPassword(password);

      const user = await this.userRepository.create({
        email,
        password: hashedPassword, 
        name,
        role: "user",
        isAdmin: false,
        experiences: [],
        projects: [],
        certificates: [],
        skills: [],
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
        role: "user",
        isAdmin: false,
        experiences: [],
        projects: [],
        certificates: [],
        skills: [],
      });

      const token = this.authService.generateToken(user);
      return { user, token };
    }
  }
}
