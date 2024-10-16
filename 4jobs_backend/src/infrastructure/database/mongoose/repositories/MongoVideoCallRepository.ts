import { injectable } from 'inversify';
import { IVideoCallRepository } from '../../../../domain/interfaces/repositories/IVideoCallRepository';
import { VideoCall } from '../../../../domain/entities/VideoCall';
import { VideoCallModel } from '../models/VideoCallModel';

@injectable()
export class MongoVideoCallRepository implements IVideoCallRepository {
  async create(videoCall: VideoCall): Promise<VideoCall> {
    const createdVideoCall = await VideoCallModel.create(videoCall);
    return this.mapToEntity(createdVideoCall);
  }

  async findById(id: string): Promise<VideoCall | null> {
    const videoCall = await VideoCallModel.findById(id);
    return videoCall ? this.mapToEntity(videoCall) : null;
  }

  async updateStatus(id: string, status: 'pending' | 'active' | 'ended'): Promise<VideoCall> {
    const updatedVideoCall = await VideoCallModel.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    if (!updatedVideoCall) {
      throw new Error('Video call not found');
    }
    return this.mapToEntity(updatedVideoCall);
  }

  async findActiveCallForUser(userId: string): Promise<VideoCall | null> {
    const activeCall = await VideoCallModel.findOne({ userId, status: 'active' });
    return activeCall ? this.mapToEntity(activeCall) : null;
  }

  async findActiveCallForRecruiter(recruiterId: string): Promise<VideoCall | null> {
    const activeCall = await VideoCallModel.findOne({ recruiterId, status: 'active' });
    return activeCall ? this.mapToEntity(activeCall) : null;
  }

  async findPendingCallForRecruiter(recruiterId: string): Promise<VideoCall | null> {
    const pendingCall = await VideoCallModel.findOne({ recruiterId, status: 'pending' });
    return pendingCall ? this.mapToEntity(pendingCall) : null;
  }

  private mapToEntity(document: any): VideoCall {
    return new VideoCall(
      document._id.toString(),
      document.recruiterId,
      document.userId,
      document.status,
      document.startTime,
      document.endTime
    );
  }
}
