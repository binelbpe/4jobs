import { injectable } from 'inversify';

@injectable()
export class UserManager {
  private userConnections: Map<string, string> = new Map();

  addUser(userId: string, socketId: string) {
    this.userConnections.set(userId, socketId);
    console.log(`User ${userId} connected with socket ${socketId}`);
    console.log('Current userConnections:', Array.from(this.userConnections.entries()));
  }

  removeUser(userId: string) {
    this.userConnections.delete(userId);
    console.log(`User ${userId} disconnected`);
    console.log('Current userConnections after disconnect:', Array.from(this.userConnections.entries()));
  }

  getUserSocketId(userId: string): string | undefined {
    return this.userConnections.get(userId);
  }

  getAllConnections() {
    return Array.from(this.userConnections.entries());
  }

  isUserOnline(userId: string): boolean {
    return this.userConnections.has(userId);
  }
}