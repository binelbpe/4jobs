import { injectable } from 'inversify';
import { IRecruiterSearchRepository } from '../../../../domain/interfaces/repositories/recruiter/IRecruiterSearchRepository';
import { UserSearchResult } from '../../../../domain/entities/UserSearchResult';
import { IUserDocument } from '../../../../domain/entities/User';
import { UserModel } from '../models/UserModel';
import { Document } from 'mongoose';

@injectable()
export class MongoRecruiterSearchRepository implements IRecruiterSearchRepository {
  async searchUsers(query: string): Promise<UserSearchResult[]> {
    const searchFields = ['name', 'email', 'skills'];
    const searchQuery = searchFields.map((field: string) => ({
      [field]: { $regex: query, $options: 'i' }
    }));

    const users = await UserModel.find({ $or: searchQuery });
    return users.map(user => this.toUserSearchResult(user));
  }

  private toUserSearchResult(userDoc: IUserDocument & Document): UserSearchResult {
    return {
      id: userDoc._id.toString(),
      name: userDoc.name,
      email: userDoc.email,
      skills: userDoc.skills,
      profileImage: userDoc.profileImage
    };
  }
}
