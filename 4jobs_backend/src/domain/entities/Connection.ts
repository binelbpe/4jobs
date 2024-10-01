export class Connection {
  constructor(
    public id: string,
    public requesterId: string,
    public recipientId: string,
    public status: 'pending' | 'accepted' | 'rejected',
    public createdAt: Date
  ) {}
}