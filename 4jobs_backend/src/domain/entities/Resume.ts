import { User } from "./User";

export class Resume {
  constructor(
    public id: string,
    public user: User,
    public resumeUrl: string,
    public createdAt: Date,
    public updatedAt: Date
  ) {}
}
