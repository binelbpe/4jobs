export class UserVideoCall {
  constructor(
    public id: string,
    public callerId: string,
    public recipientId: string,
    public status: 'pending' | 'accepted' | 'rejected' | 'ended' | 'initiating',
    public mediaStatus: {
      audio: boolean;
      video: boolean;
    },
    public createdAt: Date,
    public updatedAt: Date,
    public expiresAt: Date
  ) {}
}
