import { Request, Response } from "express";
import { injectable, inject } from "inversify";
import { EventEmitter } from "events";
import TYPES from "../../../types";
import { ConnectionUseCase } from "../../../application/usecases/user/ConnectionUseCase";
import { UserManager } from "../../../infrastructure/services/UserManager";
import { NotificationModel } from "../../../infrastructure/database/mongoose/models/NotificationModel";
import { UserModel } from "../../../infrastructure/database/mongoose/models/UserModel";
import { ConnectionModel } from "../../../infrastructure/database/mongoose/models/ConnectionModel";

@injectable()
export class ConnectionController {
  constructor(
    @inject(TYPES.ConnectionUseCase)
    private connectionUseCase: ConnectionUseCase,
    @inject(TYPES.UserManager) private userManager: UserManager,
    @inject(TYPES.NotificationEventEmitter) private eventEmitter: EventEmitter
  ) {}

  async sendConnectionRequest(req: Request, res: Response): Promise<void> {
    try {
      const { senderId, recipientId } = req.body;
      const connection = await this.connectionUseCase.sendConnectionRequest(
        senderId,
        recipientId
      );
      await this.createAndEmitNotification(
        "connection_request",
        senderId,
        recipientId,
        connection.id
      );
      res.json({ message: "Connection request sent successfully", connection });
    } catch (error) {
      this.handleError(res, error, "Failed to send connection request");
    }
  }

  async getNotifications(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId;
      const notifications = await NotificationModel.find({
        recipient: userId,
        status: { $ne: "read" },
      })
        .sort({ createdAt: -1 })
        .limit(20);
      res.json(notifications);
    } catch (error) {
      this.handleError(res, error, "Failed to get notifications");
    }
  }

  async getRecommendations(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId;
      const recommendations = await this.connectionUseCase.getRecommendations(
        userId
      );
      res.json(recommendations);
    } catch (error) {
      this.handleError(res, error, "Failed to get recommendations");
    }
  }

  async getConnectionProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId;
      const profile = await this.connectionUseCase.getConnectionProfile(userId);
      res.json(profile);
    } catch (error) {
      this.handleError(res, error, "Failed to get connection profile");
    }
  }

  async getConnectionRequests(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId;
      const requests = await this.connectionUseCase.getConnectionRequests(
        userId
      );
      res.json(requests);
    } catch (error) {
      this.handleError(res, error, "Failed to get connection requests");
    }
  }

  async acceptConnectionRequest(req: Request, res: Response): Promise<void> {
    try {
      const { connectionId } = req.params;
      const { userId } = req.body;
      const connection = await this.connectionUseCase.acceptConnectionRequest(
        connectionId
      );
      await this.createAndEmitNotification(
        "connection_accepted",
        userId,
        connection.requesterId,
        connection.id
      );
      res.json({
        message: "Connection request accepted successfully",
        connection,
      });
    } catch (error) {
      this.handleError(res, error, "Failed to accept connection request");
    }
  }

  async rejectConnectionRequest(req: Request, res: Response): Promise<void> {
    try {
      const { connectionId } = req.params;
      const { userId } = req.body;
      const connection = await this.connectionUseCase.rejectConnectionRequest(
        connectionId
      );
      res.json({
        message: "Connection request rejected successfully",
        connection,
      });
    } catch (error) {
      this.handleError(res, error, "Failed to reject connection request");
    }
  }

  private async createAndEmitNotification(
    type: string,
    senderId: string,
    recipientId: string,
    relatedItemId: string
  ): Promise<void> {
    const sender = await UserModel.findById(senderId);
    if (sender) {
      const message =
        type === "connection_request"
          ? `${sender.name} sent you a connection request`
          : `${sender.name} accepted your connection request`;

      const notification = await NotificationModel.create({
        type,
        message,
        sender: senderId,
        recipient: recipientId,
        relatedItem: relatedItemId,
        status: "unread",
      });
      this.eventEmitter.emit("sendNotification", notification);
    }
  }

  async getConnections(req: Request, res: Response) {
    try {
      const userId = req.params.userId;
      const result = await this.connectionUseCase.getConnections(userId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch connections" });
    }
  }

  async searchConnections(req: Request, res: Response) {
    try {
      const userId = req.params.userId;
      const query = req.query.query as string;
      const result = await this.connectionUseCase.searchConnections(
        userId,
        query
      );
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to search connections" });
    }
  }

  async searchMessageConnections(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId;
      const query = req.query.query as string;
      const results = await this.connectionUseCase.searchMessageConnections(
        userId,
        query
      );
      res.json(results);
    } catch (error) {
      this.handleError(res, error, "Failed to search message connections");
    }
  }

  private handleError(res: Response, error: any, message: string): void {
    console.error(`Error: ${message}`, error);
    res.status(500).json({ error: message });
  }

  async deleteConnection(req: Request, res: Response): Promise<void> {
    try {
      const { userId, connectionId } = req.params; 
      const deletedConnection = await this.connectionUseCase.deleteConnection(userId, connectionId); 
      if (!deletedConnection) {
        res.status(404).json({ message: 'Connection not found' });
        return; 
      }
      res.json({ message: 'Connection removed successfully', deletedConnection }); 
    } catch (error) {
      this.handleError(res, error, 'Failed to remove connection'); 
    }
  }
}
