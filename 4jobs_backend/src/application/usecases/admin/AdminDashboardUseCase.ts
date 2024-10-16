import { inject, injectable } from "inversify";
import TYPES from "../../../types";
import { IAdminRepository } from "../../../domain/interfaces/repositories/admin/IAdminRepository";

@injectable()
export class AdminDashboardUseCase {
  constructor(
    @inject(TYPES.IAdminRepository) private adminRepository: IAdminRepository
  ) {}

  async execute() {
    const userCount = await this.adminRepository.getUserCount();
    const recruiterCount = await this.adminRepository.getRecruiterCount();
    const companyCount = await this.adminRepository.getCompanyCount();
    const totalRevenue = await this.adminRepository.getTotalRevenue();
    const revenueData = await this.adminRepository.getMonthlyRevenue();
    const jobPostCount = await this.adminRepository.getJobPostCount();
    const userPostCount = await this.adminRepository.getUserPostCount();

    return {
      userCount,
      recruiterCount,
      companyCount,
      totalRevenue,
      revenueData,
      jobPostCount,
      userPostCount,
    };
  }
}
