import { inject, injectable } from 'inversify';
import { IVideoCallRepository } from '../../../domain/interfaces/repositories/IVideoCallRepository';
import { VideoCall } from '../../../domain/entities/VideoCall';
import TYPES from '../../../types';

@injectable()
export class RespondToVideoCallUseCase {
  constructor(
    @inject(TYPES.IVideoCallRepository) private videoCallRepository: IVideoCallRepository
  ) {}

  async execute(callerId: string, accept: boolean): Promise<VideoCall> {
    const videoCall = await this.videoCallRepository.findPendingCallForRecruiter(callerId);
    if (!videoCall) {
      throw new Error('Video call not found');
    }

    const newStatus = accept ? 'active' : 'ended';
    return this.videoCallRepository.updateStatus(videoCall.id, newStatus);
  }
}
