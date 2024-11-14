import { injectable } from "inversify";
import mongoose from "mongoose";
import { IMessageRepository } from "../../../../domain/interfaces/repositories/user/IMessageRepository";
import { Message } from "../../../../domain/entities/Message";
import { MUser } from "../../../../domain/entities/User";
import { MessageModel, IMessage } from "../models/MessageModel";

@injectable()
export class UserMessageRepository implements IMessageRepository {
  async create(message: Partial<Message>): Promise<Message> {
    const newMessage = new MessageModel({
      sender: typeof message.sender === "string" ? new mongoose.Types.ObjectId(message.sender) : message.sender?.id,
      recipient: typeof message.recipient === "string" ? new mongoose.Types.ObjectId(message.recipient) : message.recipient?.id,
      content: message.content,
      createdAt: message.createdAt,
      isRead: message.isRead,
      status: message.status || 'sent',
    });
    await newMessage.save();
    return this.mapToEntity(await newMessage.populate("sender recipient"));
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

  async getUnreadCount(userId: string): Promise<number> {
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
            { sender: new mongoose.Types.ObjectId(userId) },
            { recipient: new mongoose.Types.ObjectId(userId) },
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
              { $eq: ["$sender", new mongoose.Types.ObjectId(userId)] },
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

  async updateStatus(messageId: string, status: 'sent' | 'delivered' | 'read'): Promise<void> {
    await MessageModel.findByIdAndUpdate(messageId, { status });
  }

  private mapToEntity(message: IMessage): Message {
    return {
      id: message._id.toString(),
      sender: this.mapUserToEntity(message.sender),
      recipient: this.mapUserToEntity(message.recipient),
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
      password: '',
    } as MUser;
  }
}
