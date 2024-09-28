import { Request, Response } from "express";
import { injectable, inject } from "inversify";
import TYPES from "../../../types";
import { ApplyForJobUseCase } from "../../../application/usecases/user/ApplyForJobUseCase";
import { GetJobPostByIdUseCase } from "../../../application/usecases/user/GetJobPostByIdUseCase";
import { GetJobPostsUseCase } from "../../../application/usecases/user/GetJobPostsUseCase";

@injectable()
export class JobPostControllerUser {
  constructor(
    @inject(TYPES.ApplyForJobUseCase)
    private applyForJobUseCase: ApplyForJobUseCase,

    @inject(TYPES.GetJobPostByIdUseCase)
    private getJobPostByIdUseCase: GetJobPostByIdUseCase,

    @inject(TYPES.GetJobPostsUseCase)
    private getJobPostsUseCase: GetJobPostsUseCase
  ) {}

  // Fetch all job posts
  async getJobPosts(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const sortBy = (req.query.sortBy as string) || "createdAt";
      const sortOrder = (req.query.sortOrder as string) || "desc";
      const filter = req.query.filter
        ? { ...JSON.parse(req.query.filter as string), status: "Open" }
        : { status: "Open" };

      const result = await this.getJobPostsUseCase.execute(
        page,
        limit,
        sortBy,
        sortOrder,
        filter
      );

      res.status(200).json({
        jobPosts: result.jobPosts,
        currentPage: page,
        totalPages: result.totalPages,
        totalCount: result.totalCount,
      });
    } catch (error) {
      console.error("Error fetching job posts:", error);
      res.status(500).json({ error: "Failed to fetch job posts" });
    }
  }

  // Fetch job post by ID
  async getJobPostById(req: Request, res: Response) {
    try {
      const jobPostId = req.params.id;
      const jobPost = await this.getJobPostByIdUseCase.execute(jobPostId);

      if (!jobPost) {
        return res.status(404).json({ error: "Job post not found" });
      }

      res.status(200).json(jobPost);
    } catch (error) {
      console.error("Error fetching job post:", error);
      res.status(500).json({ error: "Failed to fetch job post" });
    }
  }

  // Apply for a job post
  async applyForJob(req: Request, res: Response) {
    try {
      const { userId } = req.body;
      const { jobId } = req.params;

      const result = await this.applyForJobUseCase.execute(userId, jobId);
      console.log("apply", result);

      res.status(200).json(result);
    } catch (error: any) {
      console.error("Error applying for job:", error.message);

      // If it's a known error (business logic error), return 400 (Bad Request)
      if (
        error.message === "User not found" ||
        error.message === "Job post not found" ||
        error.message === "Already applied for this job"
      ) {
        return res.status(400).json({ error: error.message });
      }

      // Otherwise, return 500 (Internal Server Error)
      res.status(500).json({ message: "An unexpected error occurred" });
    }
  }
}
