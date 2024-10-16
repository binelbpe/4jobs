import { VideoCall } from '../../entities/VideoCall';

export interface IVideoCallRepository {
  create(videoCall: VideoCall): Promise<VideoCall>;
  findById(id: string): Promise<VideoCall | null>;
  updateStatus(id: string, status: 'pending' | 'active' | 'ended'): Promise<VideoCall>;
  findActiveCallForUser(userId: string): Promise<VideoCall | null>;
  findActiveCallForRecruiter(recruiterId: string): Promise<VideoCall | null>;
  findPendingCallForRecruiter(recruiterId: string): Promise<VideoCall | null>;
}
