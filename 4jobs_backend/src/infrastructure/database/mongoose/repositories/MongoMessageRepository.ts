import { injectable } from "inversify";
import mongoose from "mongoose";
import { IMessageRepository } from "../../../../domain/interfaces/repositories/user/IMessageRepository";
import { Message } from "../../../../domain/entities/Message";
import { User } from "../../../../domain/entities/User";
import { MessageModel, IMessage } from "../models/MessageModel";

@injectable()
export class MessageRepository implements IMessageRepository {
  constructor() {
    this.mapToEntity = this.mapToEntity.bind(this);
    this.mapUserToEntity = this.mapUserToEntity.bind(this);
  }

  async create(message: Partial<Message>): Promise<Message> {
    const newMessage = new MessageModel({
      ...message,
      sender: typeof message.sender === "string" ? new mongoose.Types.ObjectId(message.sender) : message.sender,
      recipient: typeof message.recipient === "string" ? new mongoose.Types.ObjectId(message.recipient) : message.recipient,
      status: message.status || 'sent', // Default to 'sent' if not provided
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

    console.log("ivide kweriii",connections)

    return connections.map((conn) => ({
      user: conn.user._id.toString(),
      lastMessage: this.mapToEntity(conn.lastMessage),
    }));
  }

  private mapToEntity(message: IMessage): Message {
    return {
      id: message._id.toString(),
      sender: message.sender ? this.mapUserToEntity(message.sender) : message.sender,
      recipient: message.recipient ? this.mapUserToEntity(message.recipient) : message.recipient,
      content: message.content,
      createdAt: message.createdAt,
      isRead: message.isRead,
      status: message.status,
    };
  }

  private mapUserToEntity(user: any): User {
    if (!user) {
      throw new Error("User object is undefined or null");
    }
    return {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      profileImage: user.profileImage,
      password: "",
      role: user.role || "user",
      isAdmin: user.isAdmin || false,
      phone: user.phone,
      appliedJobs: user.appliedJobs || [],
      bio: user.bio,
      about: user.about,
      experiences: user.experiences || [],
      projects: user.projects || [],
      certificates: user.certificates || [],
      skills: user.skills || [],
      dateOfBirth: user.dateOfBirth,
      gender: user.gender,
      resume: user.resume,
      isBlocked: user.isBlocked || false,
    };
  }
}