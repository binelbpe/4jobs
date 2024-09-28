import { injectable, inject } from "inversify";
import TYPES from "../../../types";
import { IAdminRepository } from "../../../domain/interfaces/repositories/admin/IAdminRepository";
import { IRecruiter } from "../../../domain/entities/Recruiter";

@injectable()
export class FetchRecruitersUseCase {
  constructor(
    @inject(TYPES.IAdminRepository) private adminRepository: IAdminRepository
  ) {}

  async execute(): Promise<IRecruiter[]> {
    return await this.adminRepository.findRecruiters();
  }
}
