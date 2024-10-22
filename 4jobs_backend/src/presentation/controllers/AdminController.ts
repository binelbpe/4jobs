import { Request, Response } from "express";
import { injectable, inject } from "inversify";
import TYPES from "../../types";
import { IAdminRepository } from "../../domain/interfaces/repositories/admin/IAdminRepository";
import { IPostRepository } from "../../domain/interfaces/repositories/user/IPostRepository";
import { JwtAuthService } from "../../infrastructure/services/JwtAuthService";
import { User } from "../../domain/entities/User";
import { IRecruiter } from "../../domain/entities/Recruiter";

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
import { ToggleUserPostBlockUseCase } from "../../application/usecases/admin/ToggleUserPostBlockUseCase";

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
    private unblockJobPostUseCase: UnblockJobPostUseCase,
    @inject(TYPES.IAdminRepository)
    private adminRepository: IAdminRepository,
    @inject(TYPES.ToggleUserPostBlockUseCase)
    private toggleUserPostBlockUseCase: ToggleUserPostBlockUseCase,
    @inject(TYPES.IPostRepository)
    private postRepository: IPostRepository,
    @inject(TYPES.JwtAuthService)
    private jwtAuthService: JwtAuthService
  ) {}

  // Admin login
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res
          .status(400)
          .json({ error: "Email and password are required" });
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
      console.log("idd admin approve", id);
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
      console.log("admin jobposts:", jobPosts);
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

  async getSubscriptions(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const result = await this.adminRepository.getSubscriptions(page, limit);
      res.status(200).json(result);
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      res.status(500).json({ error: "Failed to fetch subscriptions" });
    }
  }

  async cancelSubscription(req: Request, res: Response) {
    try {
      const { recruiterId } = req.params;
      const updatedRecruiter = await this.adminRepository.cancelSubscription(
        recruiterId
      );
      if (updatedRecruiter) {
        res.status(200).json({
          message: "Subscription cancelled successfully",
          recruiter: updatedRecruiter,
        });
      } else {
        res.status(404).json({ error: "Recruiter not found" });
      }
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      res.status(500).json({ error: "Failed to cancel subscription" });
    }
  }

  async getUserPosts(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const result = await this.postRepository.findAllAdmin(page, limit);

      const userPosts = result.posts.map((post) => ({
        id: post._id,
        userName: post.user?.name || "Unknown",
        userEmail: post.user?.email || "Unknown",
        content: post.content,
        imageUrl: post.imageUrl,
        videoUrl: post.videoUrl,
        isBlocked: post.status === "blocked",
      }));

      res.status(200).json({
        userPosts,
        totalPages: result.totalPages,
        currentPage: result.currentPage,
      });
    } catch (error) {
      console.error("Error fetching user posts:", error);
      res.status(500).json({ error: "Failed to fetch user posts" });
    }
  }

  async toggleUserPostBlock(req: Request, res: Response) {
    try {
      const { postId } = req.params;
      const updatedPost = await this.toggleUserPostBlockUseCase.execute(postId);
      res.status(200).json({
        id: updatedPost._id,
        isBlocked: updatedPost.status === "blocked",
      });
    } catch (error) {
      console.error("Error toggling user post block status:", error);
      res
        .status(500)
        .json({ error: "Failed to toggle user post block status" });
    }
  }

  // Add a new method for refreshing admin token
  async refreshAdminToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;
      const decoded = this.jwtAuthService.verifyToken(refreshToken);
      const admin = await this.adminRepository.findById(decoded.id);
      if (!admin || admin.role !== 'admin') {
        return res.status(404).json({ error: 'Admin not found' });
      }
      const newToken = this.jwtAuthService.generateToken(admin as unknown as User);
      res.json({ token: newToken, admin });
    } catch (error) {
      console.error('Error refreshing admin token:', error);
      res.status(401).json({ error: 'Invalid refresh token' });
    }
  }
}
