import { injectable } from "inversify";

@injectable()
export class AdminDashboardUseCase {
  async execute() {
    // Logic for gathering data/statistics for the admin dashboard
    const data = {
      message: "Welcome to the Admin Dashboard",
      // Add more data/statistics if needed
    };
    return data;
  }
}
