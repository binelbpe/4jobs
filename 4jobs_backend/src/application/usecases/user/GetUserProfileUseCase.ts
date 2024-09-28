import { IUserRepository } from "../../../domain/interfaces/repositories/user/IUserRepository";
import { User } from "../../../domain/entities/User";
import { injectable, inject } from "inversify";
import TYPES from "../../../types";

@injectable()
export class GetUserProfileUseCase {
  constructor(
    @inject(TYPES.IUserRepository) private userRepository: IUserRepository
  ) {}

  async execute(userId: string): Promise<User | null> {
    return await this.userRepository.findByUserId(userId);
  }
}
