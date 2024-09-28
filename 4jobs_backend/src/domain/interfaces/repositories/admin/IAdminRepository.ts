
import { User } from "../../../entities/User";

import { IRecruiter } from "../../../entities/Recruiter";

export interface IAdminRepository {
  findAllUsers(): Promise<User[]>;
  blockUserById(id: string): Promise<User | null>;
  unBlockUserById(id: string): Promise<User | null>;
  save(recruiter: IRecruiter): Promise<IRecruiter>;
  findRecruiters(): Promise<IRecruiter[]>;
  findById(id: string): Promise<IRecruiter | null>;
 
}
