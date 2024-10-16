export class VideoCall {
  constructor(
    public id: string,
    public recruiterId: string,
    public userId: string,
    public status: 'pending' | 'active' | 'ended',
    public startTime?: Date,
    public endTime?: Date
  ) {}
}
