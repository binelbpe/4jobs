import { injectable } from 'inversify';



@injectable()

export class UserManager {

  private userConnections: Map<string, { socketId: string, userType: 'user' | 'recruiter' }> = new Map();

  private typingUsers: Map<string, Set<string>> = new Map(); // conversationId -> Set of typing user IDs



  addUser(userId: string, socketId: string, userType: 'user' | 'recruiter') {

    this.userConnections.set(userId, { socketId, userType });

    console.log(`${userType} ${userId} connected with socket ${socketId}`);

    // Handle video call connections if necessary

    // This can be expanded based on the requirements

    console.log('Current userConnections:', Array.from(this.userConnections.entries()));

  }



  removeUser(userId: string) {

    this.userConnections.delete(userId);

    console.log(`User ${userId} disconnected`);

    console.log('Current userConnections after disconnect:', Array.from(this.userConnections.entries()));

  }



  getUserSocketId(userId: string): string | undefined {

    return this.userConnections.get(userId)?.socketId;

  }



  getUserType(userId: string): 'user' | 'recruiter' | undefined {

    return this.userConnections.get(userId)?.userType;

  }



  getAllConnections() {

    return Array.from(this.userConnections.entries());

  }



  isUserOnline(userId: string): boolean {

    return this.userConnections.has(userId);

  }



  setUserTyping(userId: string, conversationId: string) {

    if (!this.typingUsers.has(conversationId)) {

      this.typingUsers.set(conversationId, new Set());

    }

    this.typingUsers.get(conversationId)!.add(userId);

  }



  setUserStoppedTyping(userId: string, conversationId: string) {

    if (this.typingUsers.has(conversationId)) {

      this.typingUsers.get(conversationId)!.delete(userId);

    }

  }



  getTypingUsers(conversationId: string): string[] {

    return Array.from(this.typingUsers.get(conversationId) || []);

  }

}


