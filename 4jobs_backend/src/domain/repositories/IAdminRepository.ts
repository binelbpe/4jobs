export interface IAdminRepository {
  // ... (existing methods)
  getUserCount(): Promise<number>;
  getRecruiterCount(): Promise<number>;
  getCompanyCount(): Promise<number>;
  getTotalRevenue(): Promise<number>;
  getMonthlyRevenue(): Promise<{ month: string; amount: number }[]>;
}
