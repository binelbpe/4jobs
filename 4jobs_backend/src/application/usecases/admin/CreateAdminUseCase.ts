import { IUserRepository } from "../../../domain/interfaces/repositories/user/IUserRepository";
import { IAuthService } from "../../../domain/interfaces/services/IAuthService";
import  {Admin}  from "../../../domain/entities/Admin";
import { injectable } from "inversify";

@injectable()
export class CreateAdminUseCase {
  constructor(
    private userRepository: IUserRepository,
    private authService: IAuthService
  ) {}

  async execute(
    email: string,
    password: string,
    name: string,
    adminLevel: number
  ): Promise<Admin> {
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error("User already exists");
    }

    const hashedPassword = await this.authService.hashPassword(password);
    const admin = await this.userRepository.create({
      email,
      password,
      name,
      role: "admin",
      isAdmin: true,
      experiences: [], 
      projects: [], 
      certificates: [], 
      skills: [], 
    });

    const adminUser: Admin = {
      ...admin,
      adminLevel,
    };

    if (admin.id) {
      await this.userRepository.update(admin.id, adminUser);
    }

    return adminUser;
  }
}
