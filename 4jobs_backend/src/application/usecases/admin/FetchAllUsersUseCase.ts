import { injectable, inject } from "inversify";
import TYPES from "../../../types";
import { IAdminRepository } from "../../../domain/interfaces/repositories/admin/IAdminRepository";
import { User } from "../../../domain/entities/User";

@injectable()
export class FetchAllUsersUseCase {
  constructor(
    @inject(TYPES.IAdminRepository) private adminRepository: IAdminRepository
  ) {}

  async execute(): Promise<User[]> {
    return await this.adminRepository.findAllUsers();
  }
}
