import { injectable, inject } from "inversify";
import TYPES from "../../../types";
import { IUserRepository } from "../../../domain/interfaces/repositories/user/IUserRepository";
import { IJobPostUserRepository } from "../../../domain/interfaces/repositories/user/IJobPostUserRepository";
import { ObjectId } from "mongodb";  // Import ObjectId from MongoDB

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

    // Convert jobId and userId to ObjectId if needed
    const jobObjectId = new ObjectId(jobId);
    const userObjectId = new ObjectId(userId);

    console.log("job post applied===========================", user.appliedJobs);
    console.log("user applied===============================", jobPost.applicants);

    // Check if the job is already applied by the user
    const userHasApplied = user.appliedJobs?.some(
      (appliedJobId) => appliedJobId.toString() === jobObjectId.toString()
    );
    
    // Check if the user is already an applicant for the job post
    const jobHasApplicant = jobPost.applicants?.some(
      (applicantId) => applicantId.toString() === userObjectId.toString()
    );

    if (userHasApplied) throw new Error("Already applied for this job");
    if (jobHasApplicant) throw new Error("Already applied for this job");

    // Update user applied jobs
    let result =await this.userRepository.updateAppliedJobs(userId, jobId);

    // Update job post applicants
    await this.jobPostRepository.update(jobId, userId);

    return result;
  }
}
