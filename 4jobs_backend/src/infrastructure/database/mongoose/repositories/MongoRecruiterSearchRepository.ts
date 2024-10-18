import { injectable } from 'inversify';
import { IRecruiterSearchRepository } from '../../../../domain/interfaces/repositories/recruiter/IRecruiterSearchRepository';
import { UserSearchResult } from '../../../../domain/entities/UserSearchResult';
import { IUserDocument } from '../../../../domain/entities/User';
import { UserModel } from '../models/UserModel';
import { Document } from 'mongoose';

@injectable()
export class MongoRecruiterSearchRepository implements IRecruiterSearchRepository {
  async searchUsers(query: string): Promise<UserSearchResult[]> {
    const users = await UserModel.find({ 
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
        { skills: { $elemMatch: { $regex: query, $options: 'i' } } }
      ]
    }).limit(10);
    return users.map((userDoc: IUserDocument) => ({
      id: userDoc._id.toString(),
      name: userDoc.name,
      email: userDoc.email,
      skills: userDoc.skills,
      profileImage: userDoc.profileImage
    }));
  }
}
