export class UserVideoCall {
  constructor(
    public id: string,
    public callerId: string,
    public recipientId: string,
    public status: 'pending' | 'accepted' | 'rejected' | 'ended',
    public createdAt: Date,
    public updatedAt: Date
  ) {}
}
