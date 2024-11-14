export class UserRecruiterMessage {
  constructor(
    public id: string,
    public conversationId: string,
    public senderId: string,
    public receiverId: string,
    public senderType: 'user' | 'recruiter',
    public content: string,
    public timestamp: Date,
    public isRead: boolean = false
  ) {}
}

export class UserRecruiterConversation {
  constructor(
    public id: string,
    public userId: string,
    public recruiterId: string,
    public lastMessage: string,
    public lastMessageTimestamp: Date
  ) {}
}

