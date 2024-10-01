import { Request, Response } from 'express';
import { injectable, inject } from 'inversify';
import { EventEmitter } from 'events';
import TYPES from "../../../types";
import { ConnectionUseCase } from '../../../application/usecases/user/ConnectionUseCase';
import { UserManager } from '../../../infrastructure/services/UserManager';
import { NotificationModel } from '../../../infrastructure/database/mongoose/models/NotificationModel';
import { UserModel } from '../../../infrastructure/database/mongoose/models/UserModel'

@injectable()
export class ConnectionController {
  constructor(
    @inject(TYPES.ConnectionUseCase) private connectionUseCase: ConnectionUseCase,
    @inject(TYPES.UserManager) private userManager: UserManager,
    @inject(TYPES.NotificationEventEmitter) private eventEmitter: EventEmitter
  ) {}

  async sendConnectionRequest(req: Request, res: Response): Promise<void> {
    try {
      const { senderId, recipientId } = req.body;
      console.log(`Sending connection request from ${senderId} to ${recipientId}`);
      const connection = await this.connectionUseCase.sendConnectionRequest(senderId, recipientId);

      const sender = await UserModel.findById(senderId);
      if (sender) {
        const notification = await NotificationModel.create({
          type: 'connection_request',
          message: `${sender.name} sent you a connection request`,
          sender: senderId,
          recipient: recipientId,
          relatedItem: connection.id,
          status: 'unread'
        });
console.log("notification",notification)
        this.eventEmitter.emit('sendNotification', notification);
      }

      res.json({ message: 'Connection request sent successfully', connection });
    } catch (error) {
      console.error("Error sending connection request:", error);
      res.status(500).json({ error: 'Failed to send connection request' });
    }
  }

  async getNotifications(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId;
      const notifications = await NotificationModel.find({ 
        recipient: userId, 
        status: { $ne: "read" } 
      })
        .sort({ createdAt: -1 })
        .limit(20);

      console.log("Notifications fetched:", notifications);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ error: 'Failed to get notifications' });
    }
  }

  async getRecommendations(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId;
      const recommendations = await this.connectionUseCase.getRecommendations(userId);
      res.json(recommendations);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      res.status(500).json({ error: 'Failed to get recommendations' });
    }
  }
}
