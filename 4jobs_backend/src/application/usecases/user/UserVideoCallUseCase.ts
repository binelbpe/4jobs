import { inject, injectable } from 'inversify';
import TYPES from '../../../types';
import { IUserVideoCallRepository } from '../../../domain/interfaces/repositories/user/IUserVideoCallRepository';
import { UserVideoCall } from '../../../domain/entities/UserVideoCall';

@injectable()
export class UserVideoCallUseCase {
  constructor(
    @inject(TYPES.IUserVideoCallRepository) private userVideoCallRepository: IUserVideoCallRepository
  ) {}

  async initiateCall(callerId: string, recipientId: string): Promise<UserVideoCall> {
    const activeCall = await this.userVideoCallRepository.getActiveCall(callerId);
    if (activeCall) {
      console.log(`[VIDEO CALL] User ${callerId} already has an active call. Ending previous call.`);
      await this.endCall(activeCall.id);
    }
    return this.userVideoCallRepository.create(callerId, recipientId);
  }

  async respondToCall(callId: string, status: 'accepted' | 'rejected'): Promise<UserVideoCall> {
    return this.userVideoCallRepository.updateStatus(callId, status);
  }

  async endCall(callId: string): Promise<UserVideoCall> {
    return this.userVideoCallRepository.updateStatus(callId, 'ended');
  }

  async getActiveCall(userId: string): Promise<UserVideoCall | null> {
    return this.userVideoCallRepository.getActiveCall(userId);
  }
}
