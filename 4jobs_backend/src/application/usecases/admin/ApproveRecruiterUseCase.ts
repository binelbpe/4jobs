import { injectable, inject } from "inversify";
import TYPES from "../../../types";
import { IAdminRepository } from "../../../domain/interfaces/repositories/admin/IAdminRepository";
import { IRecruiter } from "../../../domain/entities/Recruiter";

@injectable()
export class ApproveRecruiterUseCase {
  constructor(
    @inject(TYPES.IAdminRepository) private adminRepository: IAdminRepository
  ) {}

  async execute(id: string): Promise<IRecruiter | null> {
    const recruiter = await this.adminRepository.findById(id);
    if (!recruiter) {
      throw new Error("Recruiter not found");
    }

    recruiter.isApproved = true;
    return await this.adminRepository.save(recruiter);
  }
}
