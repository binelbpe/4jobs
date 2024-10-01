import { inject, injectable } from 'inversify';
import TYPES from '../../../types';
import { IConnectionRepository } from '../../../domain/interfaces/repositories/user/IConnectionRepository';
import { UserRecommendation } from '../../../domain/entities/User';
import { Connection } from '../../../domain/entities/Connection';

@injectable()
export class ConnectionUseCase {
  constructor(
    @inject(TYPES.IConnectionRepository) private IConnectionRepository: IConnectionRepository
  ) {}

  async getRecommendations(userId: string): Promise<UserRecommendation[]> {
    return this.IConnectionRepository.getRecommendations(userId);
  }

  async sendConnectionRequest(requesterId: string, recipientId: string): Promise<Connection> {
    const existingConnection = await this.IConnectionRepository.getConnectionStatus(requesterId, recipientId);
    if (existingConnection) {
      throw new Error('Connection request already exists');
    }
    let response= this.IConnectionRepository.createConnectionRequest(requesterId, recipientId);
 console.log("tcfgyuhijokpkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk",response)
 return response
  }
}