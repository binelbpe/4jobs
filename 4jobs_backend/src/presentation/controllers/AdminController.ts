import { Request, Response } from "express";
import { injectable, inject } from "inversify";
import TYPES from "../../types";

// Import Use Cases
import { LoginAdminUseCase } from "../../application/usecases/admin/LoginAdminUseCase";
import { CreateAdminUseCase } from "../../application/usecases/admin/CreateAdminUseCase";
import { FetchAllUsersUseCase } from "../../application/usecases/admin/FetchAllUsersUseCase";
import { BlockUserUseCase } from "../../application/usecases/admin/BlockUserUseCase";
import { UnblockUserUseCase } from "../../application/usecases/admin/UnblockUserUseCase";
import { FetchRecruitersUseCase } from "../../application/usecases/admin/FetchRecruitersUseCase";
import { ApproveRecruiterUseCase } from "../../application/usecases/admin/ApproveRecruiterUseCase";
import { AdminDashboardUseCase } from "../../application/usecases/admin/AdminDashboardUseCase";
import { FetchJobPostsUseCase } from "../../application/usecases/admin/FetchJobPostsUseCase";
import { BlockJobPostUseCase } from "../../application/usecases/admin/BlockJobPostUseCase";
import { UnblockJobPostUseCase } from "../../application/usecases/admin/UnblockJobPostUseCase";
@injectable()
export class AdminController {
  constructor(
    @inject(TYPES.LoginAdminUseCase)
    private loginAdminUseCase: LoginAdminUseCase,
    @inject(TYPES.FetchAllUsersUseCase)
    private fetchAllUsersUseCase: FetchAllUsersUseCase,
    @inject(TYPES.BlockUserUseCase)
    private blockUserUseCase: BlockUserUseCase,
    @inject(TYPES.UnblockUserUseCase)
    private unblockUserUseCase: UnblockUserUseCase,
    @inject(TYPES.FetchRecruitersUseCase)
    private fetchRecruitersUseCase: FetchRecruitersUseCase,
    @inject(TYPES.ApproveRecruiterUseCase)
    private approveRecruiterUseCase: ApproveRecruiterUseCase,
    @inject(TYPES.AdminDashboardUseCase)
    private adminDashboardUseCase: AdminDashboardUseCase,
    @inject(TYPES.FetchJobPostsUseCase)
    private fetchJobPostsUseCase: FetchJobPostsUseCase,
    @inject(TYPES.BlockJobPostUseCase)
    private blockJobPostUseCase: BlockJobPostUseCase,
    @inject(TYPES.UnblockJobPostUseCase)
    private unblockJobPostUseCase: UnblockJobPostUseCase
  ) {}

  // Admin login
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }

      const result = await this.loginAdminUseCase.execute(email, password);
      res.status(200).json(result);
    } catch (error) {
      console.error("Error during admin login:", error);
      res.status(400).json({ error: (error as Error).message });
    }
  }



  // Fetch all users
  async fetchUsers(req: Request, res: Response) {
    try {
      const users = await this.fetchAllUsersUseCase.execute();
      res.status(200).json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  }

  // Block user
  async blockUser(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const user = await this.blockUserUseCase.execute(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.status(200).json(user);
    } catch (error) {
      console.error("Error blocking user:", error);
      res.status(500).json({ error: "Failed to block user" });
    }
  }

  // Unblock user
  async unblockUser(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const user = await this.unblockUserUseCase.execute(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.status(200).json(user);
    } catch (error) {
      console.error("Error unblocking user:", error);
      res.status(500).json({ error: "Failed to unblock user" });
    }
  }

  // Fetch all recruiters
  async fetchRecruiters(req: Request, res: Response) {
    try {
      const recruiters = await this.fetchRecruitersUseCase.execute();
      res.status(200).json(recruiters);
    } catch (error) {
      console.error("Error fetching recruiters:", error);
      res.status(500).json({ error: "Failed to fetch recruiters" });
    }
  }

  // Approve recruiter
  async approveRecruiter(req: Request, res: Response) {
    try {
      const { id } = req.params;
      console.log("idd admin approve",id)
      const recruiter = await this.approveRecruiterUseCase.execute(id);

      if (!recruiter) {
        return res.status(404).json({ error: "Recruiter not found" });
      }
      res.status(200).json(recruiter);
    } catch (error) {
      console.error("Error approving recruiter:", error);
      res.status(500).json({ error: "Failed to approve recruiter" });
    }
  }

  // Admin dashboard
  async dashboard(req: Request, res: Response) {
    try {
      const data = await this.adminDashboardUseCase.execute();
      res.status(200).json(data);
    } catch (error) {
      console.error("Error loading admin dashboard:", error);
      res.status(500).json({ error: "Failed to load admin dashboard" });
    }
  }

   // Fetch all job posts
   async fetchJobPosts(req: Request, res: Response) {
    try {
      const jobPosts = await this.fetchJobPostsUseCase.execute();
      console.log("admin jobposts:",jobPosts)
      res.status(200).json(jobPosts);
    } catch (error) {
      console.error("Error fetching job posts:", error);
      res.status(500).json({ error: "Failed to fetch job posts" });
    }
  }

  // Block job post
  async blockJobPost(req: Request, res: Response) {
    try {
      const { postId } = req.params;
      const jobPost = await this.blockJobPostUseCase.execute(postId);
      if (!jobPost) {
        return res.status(404).json({ error: "Job post not found" });
      }
      res.status(200).json(jobPost);
    } catch (error) {
      console.error("Error blocking job post:", error);
      res.status(500).json({ error: "Failed to block job post" });
    }
  }

  // Unblock job post
  async unblockJobPost(req: Request, res: Response) {
    try {
      const { postId } = req.params;
      const jobPost = await this.unblockJobPostUseCase.execute(postId);
      if (!jobPost) {
        return res.status(404).json({ error: "Job post not found" });
      }
      res.status(200).json(jobPost);
    } catch (error) {
      console.error("Error unblocking job post:", error);
      res.status(500).json({ error: "Failed to unblock job post" });
    }
  }
}
