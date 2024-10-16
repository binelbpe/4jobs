import { injectable } from 'inversify';
import { IUserVideoCallRepository } from '../../../../domain/interfaces/repositories/user/IUserVideoCallRepository';
import { UserVideoCall } from '../../../../domain/entities/UserVideoCall';
import { UserVideoCallModel } from '../models/UserVideoCallModel';

@injectable()
export class MongoUserVideoCallRepository implements IUserVideoCallRepository {
  async create(callerId: string, recipientId: string): Promise<UserVideoCall> {
    const videoCall = new UserVideoCallModel({
      callerId,
      recipientId,
      status: 'pending',
    });
    await videoCall.save();
    return this.mapToEntity(videoCall);
  }

  async updateStatus(callId: string, status: 'accepted' | 'rejected' | 'ended'): Promise<UserVideoCall> {
    const videoCall = await UserVideoCallModel.findByIdAndUpdate(
      callId,
      { status, updatedAt: new Date() },
      { new: true }
    );
    if (!videoCall) {
      throw new Error('Video call not found');
    }
    return this.mapToEntity(videoCall);
  }

  async getActiveCall(userId: string): Promise<UserVideoCall | null> {
    const videoCall = await UserVideoCallModel.findOne({
      $or: [{ callerId: userId }, { recipientId: userId }],
      status: { $in: ['pending', 'accepted'] },
    });
    return videoCall ? this.mapToEntity(videoCall) : null;
  }

  private mapToEntity(model: any): UserVideoCall {
    return new UserVideoCall(
      model._id.toString(),
      model.callerId,
      model.recipientId,
      model.status,
      model.createdAt,
      model.updatedAt
    );
  }
}
