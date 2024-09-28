import { IUserRepository } from "../../../domain/interfaces/repositories/user/IUserRepository";
import { User } from "../../../domain/entities/User";
import { injectable, inject } from "inversify";
import TYPES from "../../../types";

@injectable()
export class UpdateUserProfileUseCase {
  constructor(
    @inject(TYPES.IUserRepository) private userRepository: IUserRepository
  ) {}

  async execute(
    userId: string,
    profileData: Partial<User>
  ): Promise<User | null> {
    return await this.userRepository.update(userId, profileData);
  }
}
