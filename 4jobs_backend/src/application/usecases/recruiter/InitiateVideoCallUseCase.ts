import { inject, injectable } from 'inversify';
import { IVideoCallRepository } from '../../../domain/interfaces/repositories/IVideoCallRepository';
import { VideoCall } from '../../../domain/entities/VideoCall';
import TYPES from '../../../types';

@injectable()
export class InitiateVideoCallUseCase {
  constructor(
    @inject(TYPES.IVideoCallRepository) private videoCallRepository: IVideoCallRepository
  ) {}

  async execute(recruiterId: string, userId: string): Promise<VideoCall> {
    const existingCall = await this.videoCallRepository.findActiveCallForRecruiter(recruiterId);
    if (existingCall) {
      throw new Error('Recruiter already has an active call');
    }

    const newVideoCall = new VideoCall(
      '',
      recruiterId,
      userId,
      'pending',
      new Date()
    );

    return this.videoCallRepository.create(newVideoCall);
  }
}
