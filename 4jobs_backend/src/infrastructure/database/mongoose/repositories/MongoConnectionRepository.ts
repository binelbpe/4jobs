import { injectable } from 'inversify';
import { IConnectionRepository } from '../../../../domain/interfaces/repositories/user/IConnectionRepository';
import { Connection } from '../../../../domain/entities/Connection';
import { UserRecommendation } from '../../../../domain/entities/User';
import { ConnectionModel } from '../models/ConnectionModel';
import { UserModel } from '../models/UserModel';

@injectable()
export class MongoConnectionRepository implements IConnectionRepository {
  async getRecommendations(userId: string): Promise<UserRecommendation[]> {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const connections = await ConnectionModel.find({
      $or: [{ requester: userId }, { recipient: userId }]
    });

    const connectedUserIds = connections.flatMap((conn) => [
      conn.requester.toString(),
      conn.recipient.toString()
    ]);

    const uniqueConnectedUserIds = [...new Set(connectedUserIds)].filter(id => id !== userId);

    const recommendedUsers = await UserModel.find({
      _id: { $nin: [userId, ...uniqueConnectedUserIds] },
      isAdmin: { $ne: true },
    }).limit(10);

    const connectionMap = new Map(connections.map(conn => [
      conn.requester.toString() === userId ? conn.recipient.toString() : conn.requester.toString(),
      conn.status
    ]));

    const recommendations: UserRecommendation[] = recommendedUsers.map((user) => {
      const recommendedUserId = user._id.toString();
      let connectionStatus: 'none' | 'pending' | 'accepted' | 'rejected' = 'none';

      if (connectionMap.has(recommendedUserId)) {
        connectionStatus = connectionMap.get(recommendedUserId) as 'pending' | 'accepted' | 'rejected';
      }

      return {
        id: recommendedUserId,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
        connectionStatus
      };
    });

    return recommendations;
  }

  async createConnectionRequest(requesterId: string, recipientId: string): Promise<Connection> {
    const newConnection = new ConnectionModel({
      requester: requesterId,
      recipient: recipientId,
      status: 'pending'
    });

    const savedConnection = await newConnection.save();

    return {
      id: savedConnection._id.toString(),
      requesterId: savedConnection.requester.toString(),
      recipientId: savedConnection.recipient.toString(),
      status: savedConnection.status,
      createdAt: savedConnection.createdAt
    };
  }

  async getConnectionStatus(requesterId: string, recipientId: string): Promise<Connection | null> {
    const connection = await ConnectionModel.findOne({
      $or: [
        { requester: requesterId, recipient: recipientId },
        { requester: recipientId, recipient: requesterId }
      ]
    });

    if (!connection) {
      return null;
    }

    return {
      id: connection._id.toString(),
      requesterId: connection.requester.toString(),
      recipientId: connection.recipient.toString(),
      status: connection.status,
      createdAt: connection.createdAt
    };
  }
}