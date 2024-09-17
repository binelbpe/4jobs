import { IUserRepository } from '../../../../core/interfaces/repositories/IUserRepository';
import { User } from '../../../../core/entities/User';
import { UserModel } from '../models/UserModel';

export class MongoUserRepository implements IUserRepository {
  async findById(id: string): Promise<User | null> {
    const user = await UserModel.findById(id).lean();
    return user ? this.mapToUser(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await UserModel.findOne({ email }).lean();
    return user ? this.mapToUser(user) : null;
  }

  async create(user: Omit<User, 'id'>): Promise<User> {
    const newUser = new UserModel(user);
    await newUser.save();
    return this.mapToUser(newUser.toObject());
  }

  async update(id: string, user: Partial<User>): Promise<User | null> {
    const updatedUser = await UserModel.findByIdAndUpdate(id, user, { new: true }).lean();
    return updatedUser ? this.mapToUser(updatedUser) : null;
  }

  private mapToUser(doc: any): User {
    return {
      id: doc._id.toString(),
      email: doc.email,
      password: doc.password,
      name: doc.name,
      role: doc.role,
      isAdmin: doc.isAdmin,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      
    };
  }
}