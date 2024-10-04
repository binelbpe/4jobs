import { injectable } from "inversify";
import { IMessageRepository } from "../../../../domain/interfaces/repositories/user/IMessageRepository";
import { Message } from "../../../../domain/entities/Message";
import { User } from "../../../../domain/entities/User";
import { MessageModel, IMessage } from "../models/MessageModel";
import { UserModel } from "../models/UserModel";
import mongoose from "mongoose";

@injectable()
export class MongoMessageRepository implements IMessageRepository {
  async create(message: Partial<Message>): Promise<Message> {
    const newMessage = new MessageModel({
      ...message,
      sender:
        typeof message.sender === "string"
          ? new mongoose.Types.ObjectId(message.sender)
          : message.sender,
      recipient:
        typeof message.recipient === "string"
          ? new mongoose.Types.ObjectId(message.recipient)
          : message.recipient,
    });
    await newMessage.save();
    return this.mapToEntity(await newMessage.populate("sender recipient"));
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

  async getLatestMessagesForUser(userId: string): Promise<Message[]> {
    const messages = await MessageModel.aggregate([
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
          latestMessage: { $first: "$$ROOT" },
        },
      },
      {
        $replaceRoot: { newRoot: "$latestMessage" },
      },
      {
        $lookup: {
          from: "users",
          localField: "sender",
          foreignField: "_id",
          as: "sender",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "recipient",
          foreignField: "_id",
          as: "recipient",
        },
      },
      {
        $unwind: "$sender",
      },
      {
        $unwind: "$recipient",
      },
      {
        $project: {
          _id: 1,
          content: 1,
          createdAt: 1,
          isRead: 1,
          "sender._id": 1,
          "sender.name": 1,
          "sender.email": 1,
          "sender.profileImage": 1,
          "recipient._id": 1,
          "recipient.name": 1,
          "recipient.email": 1,
          "recipient.profileImage": 1,
        },
      },
    ]);

    return messages.map(this.mapToEntity);
  }

  async markAsRead(messageId: string): Promise<void> {
    await MessageModel.findByIdAndUpdate(messageId, { isRead: true });
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

  private mapToEntity(message: any): Message {
    return {
      id: message._id.toString(),
      sender: this.mapUserToEntity(message.sender),
      recipient: this.mapUserToEntity(message.recipient),
      content: message.content,
      createdAt: message.createdAt,
      isRead: message.isRead,
    };
  }

  private mapUserToEntity(user: any): User {
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
