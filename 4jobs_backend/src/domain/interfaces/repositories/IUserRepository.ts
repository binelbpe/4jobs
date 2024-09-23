import { User } from '../../entities/User';

export interface IUserRepository {
  findByUserId(userId: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(user: Omit<User, 'id'>): Promise<User>;
  update(id: string, user: Partial<User>): Promise<User | null>;
}
