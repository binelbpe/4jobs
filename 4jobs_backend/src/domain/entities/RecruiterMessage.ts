export class RecruiterMessage {
  constructor(
    public id: string,
    public conversationId: string,
    public senderId: string,
    public receiverId: string,
    public senderType: 'recruiter' | 'user',
    public content: string,
    public timestamp: Date,
    public isRead: boolean = false // Add this field
  ) {}
}

export class Conversation {
  constructor(
    public id: string,
    public recruiterId: string,
    public applicantId: string,
    public lastMessage: string = '', // Add a default value here
    public lastMessageTimestamp: Date
  ) {}
}

