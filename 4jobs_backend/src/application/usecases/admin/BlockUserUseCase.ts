import { injectable, inject } from "inversify";
import TYPES from "../../../types";
import { IAdminRepository } from "../../../domain/interfaces/repositories/admin/IAdminRepository";
import { User } from "../../../domain/entities/User";

@injectable()
export class BlockUserUseCase {
  constructor(
    @inject(TYPES.IAdminRepository) private adminRepository: IAdminRepository
  ) {}

  async execute(id: string): Promise<User | null> {
    return await this.adminRepository.blockUserById(id);
  }
}
