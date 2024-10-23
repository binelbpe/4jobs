import { inject, injectable } from "inversify";
import TYPES from "../../../types";
import { IConnectionRepository } from "../../../domain/interfaces/repositories/user/IConnectionRepository";
import { UserRecommendation, User } from "../../../domain/entities/User";
import {
  Connection,
  ConnectionRequest,
} from "../../../domain/entities/Connection";
import { IUserRepository } from "../../../domain/interfaces/repositories/user/IUserRepository";

@injectable()
export class ConnectionUseCase {
  constructor(
    @inject(TYPES.IConnectionRepository)
    private connectionRepository: IConnectionRepository,
    @inject(TYPES.IUserRepository) private userRepository: IUserRepository
  ) {}

  async getRecommendations(userId: string): Promise<UserRecommendation[]> {
    return this.connectionRepository.getRecommendations(userId);
  }

  async getConnectionProfile(connectionId: string): Promise<User | null> {
    return this.connectionRepository.getConnectionProfile(connectionId);
  }

  async getConnectionRequests(userId: string): Promise<ConnectionRequest[]> {
    return this.connectionRepository.getRequests(userId);
  }

  async sendConnectionRequest(
    requesterId: string,
    recipientId: string
  ): Promise<Connection> {
    const existingConnection =
      await this.connectionRepository.getConnectionStatus(
        requesterId,
        recipientId
      );
    if (existingConnection) {
      throw new Error("Connection request already exists");
    }
    return this.connectionRepository.createConnectionRequest(
      requesterId,
      recipientId
    );
  }

  async acceptConnectionRequest(connectionId: string): Promise<Connection> {
    const connection = await this.connectionRepository.getConnectionById(
      connectionId
    );
    if (!connection) {
      throw new Error("Connection request not found");
    }
    return this.connectionRepository.updateConnectionStatus(
      connectionId,
      "accepted"
    );
  }

  async rejectConnectionRequest(connectionId: string): Promise<Connection> {
    const connection = await this.connectionRepository.getConnectionById(
      connectionId
    );
    if (!connection) {
      throw new Error("Connection request not found");
    }
    return this.connectionRepository.updateConnectionStatus(
      connectionId,
      "rejected"
    );
  }

  async getConnections(userId: string) {
    const connections = await this.connectionRepository.getConnections(userId);
    const connectionRequests =
      await this.connectionRepository.getConnectionRequestsALL(userId);
    return { connections, connectionRequests };
  }

  async searchConnections(userId: string, query: string) {
    return this.connectionRepository.searchConnections(userId, query);
  }

  async searchMessageConnections(
    userId: string,
    query: string
  ): Promise<User[]> {
    const connections = await this.connectionRepository.getConnections(userId);
    const connectedUserIds = connections.map((c: Connection) =>
      c.requesterId === userId ? c.recipientId : c.requesterId
    );
    return this.userRepository.searchUsers(query, connectedUserIds);
  }

  async deleteConnection(userId: string, connectionId: string): Promise<Connection | null> {
    return this.connectionRepository.deleteConnection(userId, connectionId); // Call repository method to delete connection
  }
}
