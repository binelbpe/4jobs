import { Connection } from '../../../../domain/entities/Connection';
import { UserRecommendation } from '../../../../domain/entities/User';

export interface IConnectionRepository {
  getRecommendations(userId: string): Promise<UserRecommendation[]>;
  createConnectionRequest(requesterId: string, recipientId: string): Promise<Connection>;
  getConnectionStatus(requesterId: string, recipientId: string): Promise<Connection | null>;
}