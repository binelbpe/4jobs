import { injectable } from "inversify";

@injectable()
export class AdminDashboardUseCase {
  async execute() {
    const data = {
      message: "Welcome to the Admin Dashboard",
    };
    return data;
  }
}
