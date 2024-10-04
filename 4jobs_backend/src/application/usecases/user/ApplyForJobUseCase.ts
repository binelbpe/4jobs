import { injectable, inject } from "inversify";
import TYPES from "../../../types";
import { IUserRepository } from "../../../domain/interfaces/repositories/user/IUserRepository";
import { IJobPostUserRepository } from "../../../domain/interfaces/repositories/user/IJobPostUserRepository";
import { ObjectId } from "mongodb";  

@injectable()
export class ApplyForJobUseCase {
  constructor(
    @inject(TYPES.IUserRepository) private userRepository: IUserRepository,
    @inject(TYPES.IJobPostUserRepository)
    private jobPostRepository: IJobPostUserRepository
  ) {}

  async execute(userId: string, jobId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new Error("User not found");

    const jobPost = await this.jobPostRepository.findById(jobId);
    if (!jobPost) throw new Error("Job post not found");


    const jobObjectId = new ObjectId(jobId);
    const userObjectId = new ObjectId(userId);




    const userHasApplied = user.appliedJobs?.some(
      (appliedJobId) => appliedJobId.toString() === jobObjectId.toString()
    );
    
    const jobHasApplicant = jobPost.applicants?.some(
      (applicantId) => applicantId.toString() === userObjectId.toString()
    );

    if (userHasApplied) throw new Error("Already applied for this job");
    if (jobHasApplicant) throw new Error("Already applied for this job");

    
    let result =await this.userRepository.updateAppliedJobs(userId, jobId);

   
    await this.jobPostRepository.update(jobId, userId);

    return result;
  }
}
