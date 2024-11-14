import { injectable } from "inversify";
import mongoose from "mongoose";
import { IMessageRepository } from "../../../../domain/interfaces/repositories/user/IMessageRepository";
import { Message } from "../../../../domain/entities/Message";
import { MUser } from "../../../../domain/entities/User";
import { MessageModel, IMessage } from "../models/MessageModel";

@injectable()
export class MessageRepository implements IMessageRepository {
  constructor() {
    this.mapToEntity = this.mapToEntity.bind(this);
    this.mapUserToEntity = this.mapUserToEntity.bind(this);
  }

  async create(message: Partial<Message>): Promise<Message> {
    const newMessage = new MessageModel({
      sender: message.sender ? this.toObjectId(message.sender) : undefined,
      recipient: message.recipient ? this.toObjectId(message.recipient) : undefined,
      content: message.content,
      createdAt: message.createdAt,
      isRead: message.isRead,
      status: message.status || 'sent',
    });
    await newMessage.save();
    const populatedMessage = await newMessage.populate("sender recipient");
    return this.mapToEntity(populatedMessage);
  }

  async findById(messageId: string): Promise<Message | null> {
    const message = await MessageModel.findById(messageId)
      .populate("sender", "name email profileImage")
      .populate("recipient", "name email profileImage");
    return message ? this.mapToEntity(message) : null;
  }

  async findByUsers(userId1: string, userId2: string): Promise<Message[]> {
    const messages = await MessageModel.find({
      $or: [
        { sender: userId1, recipient: userId2 },
        { sender: userId2, recipient: userId1 },
      ],
    })
      .sort({ createdAt: 1 })
      .populate("sender", "name email profileImage")
      .populate("recipient", "name email profileImage");
    return messages.map(this.mapToEntity);
  }

  async markAsRead(messageId: string): Promise<void> {
    await MessageModel.findByIdAndUpdate(messageId, { isRead: true, status: 'read' });
  }

  async updateStatus(messageId: string, status: 'sent' | 'delivered' | 'read'): Promise<void> {
    await MessageModel.findByIdAndUpdate(messageId, { status });
  }

  async getUnreadCount(userId: string): Promise<number> {
    // if (!mongoose.Types.ObjectId.isValid(userId)) {
    //     throw new Error("Invalid user ID format");
    // }
    return MessageModel.countDocuments({ recipient: userId, isRead: false });
}

  async searchMessages(userId: string, query: string): Promise<Message[]> {
    const messages = await MessageModel.find({
      $or: [{ sender: userId }, { recipient: userId }],
      content: { $regex: query, $options: "i" },
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate("sender", "name email profileImage")
      .populate("recipient", "name email profileImage");

    return messages.map(this.mapToEntity);
  }

  async getMessageConnections(userId: string): Promise<{ user: string; lastMessage: Message }[]> {
    const connections = await MessageModel.aggregate([
      {
        $match: {
          $or: [
            { sender: this.toObjectId(userId) },
            { recipient: this.toObjectId(userId) },
          ],
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$sender", this.toObjectId(userId)] },
              "$recipient",
              "$sender",
            ],
          },
          lastMessage: { $first: "$$ROOT" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $project: {
          user: {
            _id: "$user._id",
            name: "$user.name",
            email: "$user.email",
            profileImage: "$user.profileImage",
          },
          lastMessage: 1,
        },
      },
    ]);


    return connections.map((conn) => ({
      user: conn.user._id.toString(),
      lastMessage: this.mapToEntity(conn.lastMessage),
    }));
  }

  private mapToEntity(message: IMessage): Message {
    return {
      id: message._id.toString(),
      sender: this.mapUserToEntity(message.sender) as MUser,
      recipient: this.mapUserToEntity(message.recipient) as MUser,
      content: message.content,
      createdAt: message.createdAt,
      isRead: message.isRead,
      status: message.status,
    };
  }

  private mapUserToEntity(user: any): MUser {
    if (!user) {
      throw new Error("User object is undefined or null");
    }
    return {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      profileImage: user.profileImage,
    } as MUser;
  }

  private toObjectId(id: string | MUser | mongoose.Types.ObjectId): mongoose.Types.ObjectId {
    if (id instanceof mongoose.Types.ObjectId) {
      return id;
    }
    if (typeof id === 'string') {
      return new mongoose.Types.ObjectId(id);
    }
    if (typeof id === 'object' && 'id' in id) {
      return new mongoose.Types.ObjectId(id.id);
    }
    throw new Error('Invalid id type');
  }
}
