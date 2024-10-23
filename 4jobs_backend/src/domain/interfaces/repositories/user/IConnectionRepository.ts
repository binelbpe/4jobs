import { Connection, ConnectionRequest } from '../../../../domain/entities/Connection';
import { UserRecommendation, User } from '../../../../domain/entities/User';

export interface IConnectionRepository {
  getRecommendations(userId: string): Promise<UserRecommendation[]>;
  getConnectionProfile(connectionId: string): Promise<User | null>;
  createConnectionRequest(requesterId: string, recipientId: string): Promise<Connection>;
  getConnectionStatus(requesterId: string, recipientId: string): Promise<Connection | null>;
  getRequests(userId: string): Promise<ConnectionRequest[]>;
  getConnectionById(connectionId: string): Promise<Connection | null>;
  updateConnectionStatus(connectionId: string, status: 'accepted' | 'rejected'): Promise<Connection>;
  deleteConnection(userId: string, connectionId: string): Promise<Connection | null>;
  getConnections(userId: string): Promise<any[]>;
  getConnectionRequestsALL(userId: string): Promise<any[]>;
  searchConnections(userId: string, query: string): Promise<any[]>;
}
