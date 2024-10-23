import { injectable } from 'inversify';
import { IConnectionRepository } from '../../../../domain/interfaces/repositories/user/IConnectionRepository';
import { Connection, ConnectionRequest } from '../../../../domain/entities/Connection';
import { UserRecommendation, User, IUserDocument } from '../../../../domain/entities/User';
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
      $or: [{ requester: userId }, { recipient: userId }],
      status: { $in: ['accepted', 'pending'] }
    });
  
    const connectedUserIds = connections.flatMap((conn) => [
      conn.requester.toString(),
      conn.recipient.toString()
    ]);
  
    const uniqueConnectedUserIds = [...new Set(connectedUserIds)].filter(id => id !== userId);
  
    // Split the skills string into an array and create case-insensitive regex patterns
    const userSkills = user.skills && user.skills[0] ? user.skills[0].split(',').map((skill: string) => skill.trim()) : [];
    const skillPatterns = userSkills.map((skill: string) => new RegExp(skill, 'i'));

    const recommendedUsers = await UserModel.find({
      _id: { $nin: [userId, ...uniqueConnectedUserIds] },
      isAdmin: { $ne: true },
      isBlocked: { $ne: true },
      $or: [
        { skills: { $elemMatch: { $regex: skillPatterns.map((pattern: RegExp) => pattern.source).join('|'), $options: 'i' } } },
        { 'experiences.title': { $in: user.experiences?.map((exp: { title: string }) => new RegExp(exp.title, 'i')) || [] } },
        { 'experiences.company': { $in: user.experiences?.map((exp: { company: string }) => new RegExp(exp.company, 'i')) || [] } }
      ]
    }).limit(10);
  
    const pendingConnections = await ConnectionModel.find({
      $or: [
        { requester: userId, status: 'pending' },
        { recipient: userId, status: 'pending' }
      ]
    });
  
    const pendingConnectionMap = new Map(pendingConnections.map(conn => [
      conn.requester.toString() === userId ? conn.recipient.toString() : conn.requester.toString(),
      conn.requester.toString() === userId ? 'sent' : 'received'
    ]));
  
    return recommendedUsers.map((recommendedUser: IUserDocument): UserRecommendation => ({
      id: recommendedUser._id.toString(),
      name: recommendedUser.name,
      email: recommendedUser.email,
      profileImage: recommendedUser.profileImage || '',
      connectionStatus: this.mapConnectionStatus(pendingConnectionMap.get(recommendedUser._id.toString())),
      matchingCriteria: this.getMatchingCriteria(user, recommendedUser)
    }));
  }
  
  private getMatchingCriteria(currentUser: IUserDocument, recommendedUser: IUserDocument): string[] {
    const matchingCriteria: string[] = [];

    // Split the skills strings into arrays
    const currentUserSkills = currentUser.skills && currentUser.skills[0] ? currentUser.skills[0].split(',').map((s: string) => s.trim().toLowerCase()) : [];
    const recommendedUserSkills = recommendedUser.skills && recommendedUser.skills[0] ? recommendedUser.skills[0].split(',').map((s: string) => s.trim().toLowerCase()) : [];

    // Check for matching skills (case-insensitive)
    const matchingSkills = currentUserSkills.filter(skill => recommendedUserSkills.includes(skill));
    if (matchingSkills.length > 0) {
      matchingCriteria.push(`Matching skills: ${matchingSkills.join(', ')}`);
    }

    // Check for matching experience titles or companies (case-insensitive)
    currentUser.experiences?.forEach((exp: { title: string; company: string }) => {
      const matchingExperience = recommendedUser.experiences?.find((recExp: { title: string; company: string }) =>
        recExp.title.toLowerCase().includes(exp.title.toLowerCase()) ||
        recExp.company.toLowerCase().includes(exp.company.toLowerCase()) ||
        exp.title.toLowerCase().includes(recExp.title.toLowerCase()) ||
        exp.company.toLowerCase().includes(recExp.company.toLowerCase())
      );
      if (matchingExperience) {
        matchingCriteria.push(`Similar experience: ${matchingExperience.title} at ${matchingExperience.company}`);
      }
    });

    return matchingCriteria;
  }

  async getConnectionProfile(connectionId: string): Promise<User | null> {
    const user = await UserModel.findById(connectionId);
    return user ? this.mapUserToEntity(user) : null;
  }

  async createConnectionRequest(requesterId: string, recipientId: string): Promise<Connection> {
    const newConnection = new ConnectionModel({
      requester: requesterId,
      recipient: recipientId,
      status: 'pending'
    });

    const savedConnection = await newConnection.save();
    return this.mapConnectionToEntity(savedConnection);
  }

  async getConnectionStatus(requesterId: string, recipientId: string): Promise<Connection | null> {
    const connection = await ConnectionModel.findOne({
      $or: [
        { requester: requesterId, recipient: recipientId },
        { requester: recipientId, recipient: requesterId }
      ],
      status: { $in: ['pending', 'accepted'] }
    });
  
    return connection ? this.mapConnectionToEntity(connection) : null;
  }

  async getRequests(userId: string): Promise<ConnectionRequest[]> {
    const connections = await ConnectionModel.find({ recipient: userId, status: 'pending' })
      .populate('requester', 'name profileImage headline bio');
    
    return connections.map(this.mapConnectionRequestToEntity);
  }

  async getConnectionById(connectionId: string): Promise<Connection | null> {
    const connection = await ConnectionModel.findById(connectionId);
    return connection ? this.mapConnectionToEntity(connection) : null;
  }

  async updateConnectionStatus(connectionId: string, status: 'accepted' | 'rejected'): Promise<Connection> {
    const updatedConnection = await ConnectionModel.findByIdAndUpdate(
      connectionId,
      { status },
      { new: true }
    );

    if (!updatedConnection) {
      throw new Error('Connection not found');
    }



    console.log("updatedConnection",updatedConnection)

    return this.mapConnectionToEntity(updatedConnection);
  }

  private mapUserToEntity(user: any): User {
    return {
      id: user._id.toString(),
      email: user.email,
      password: user.password,
      phone: user.phone,
      name: user.name,
      role: user.role,
      isAdmin: user.isAdmin,
      appliedJobs: user.appliedJobs,
      bio: user.bio,
      about: user.about,
      experiences: user.experiences,
      projects: user.projects,
      certificates: user.certificates,
      skills: user.skills,
      profileImage: user.profileImage,
      dateOfBirth: user.dateOfBirth,
      gender: user.gender,
      resume: user.resume,
      isBlocked: user.isBlocked,
    };
  }

  private mapConnectionToEntity(connection: any): Connection {
    return {
      id: connection._id.toString(),
      requesterId: connection.requester.toString(),
      recipientId: connection.recipient.toString(),
      status: connection.status,
      createdAt: connection.createdAt
    };
  }

  private mapConnectionRequestToEntity(connection: any): ConnectionRequest {
    return {
      id: connection._id.toString(),
      requester: {
        id: connection.requester._id.toString(),
        name: connection.requester.name,
        profileImage: connection.requester.profileImage || '',
        headline: connection.requester.about || '',
        bio: connection.requester.bio || '',
      },
      status:connection.status||''
    };
  }
  private mapConnectionStatus(status: string | undefined): "none" | "pending" | "accepted" | "rejected" {
    if (status === 'sent' || status === 'received') {
      return 'pending';
    }
    return 'none';
  }



  async getConnections(userId: string) {
    const connections = await ConnectionModel.find({
      $or: [{ requester: userId }, { recipient: userId }],
      status: 'accepted'
    }).populate('requester recipient', 'name profileImage');

    return connections.map(conn => 
      conn.requester._id.toString() === userId ? conn.recipient : conn.requester
    );
  }

  async getConnectionRequestsALL(userId: string) {
    return ConnectionModel.find({
      recipient: userId,
      status: 'pending'
    }).populate('requester', 'name profileImage');
  }



  async deleteConnection(userId: string, connectionId: string): Promise<Connection | null> {
    const connection = await ConnectionModel.findOneAndDelete({
        $or: [
            { requester: userId, recipient: connectionId },
            { requester: connectionId, recipient: userId }
        ]
    });
    return connection ? this.mapConnectionToEntity(connection) : null; // Return deleted connection or null
  }

  async searchConnections(userId: string, query: string) {
    const connections = await this.getConnections(userId);
    const connectionIds = connections.map(conn => conn._id);

    return UserModel.find({
      _id: { $in: connectionIds },
      name: { $regex: query, $options: 'i' }
    }).select('name profileImage');
  }
}
