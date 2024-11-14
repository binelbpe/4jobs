"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const inversify_1 = require("inversify");
const types_1 = __importDefault(require("../../types"));
const JwtAuthService_1 = require("../../infrastructure/services/JwtAuthService");
// Import Use Cases
const LoginAdminUseCase_1 = require("../../application/usecases/admin/LoginAdminUseCase");
const FetchAllUsersUseCase_1 = require("../../application/usecases/admin/FetchAllUsersUseCase");
const BlockUserUseCase_1 = require("../../application/usecases/admin/BlockUserUseCase");
const UnblockUserUseCase_1 = require("../../application/usecases/admin/UnblockUserUseCase");
const FetchRecruitersUseCase_1 = require("../../application/usecases/admin/FetchRecruitersUseCase");
const ApproveRecruiterUseCase_1 = require("../../application/usecases/admin/ApproveRecruiterUseCase");
const AdminDashboardUseCase_1 = require("../../application/usecases/admin/AdminDashboardUseCase");
const FetchJobPostsUseCase_1 = require("../../application/usecases/admin/FetchJobPostsUseCase");
const BlockJobPostUseCase_1 = require("../../application/usecases/admin/BlockJobPostUseCase");
const UnblockJobPostUseCase_1 = require("../../application/usecases/admin/UnblockJobPostUseCase");
const ToggleUserPostBlockUseCase_1 = require("../../application/usecases/admin/ToggleUserPostBlockUseCase");
let AdminController = class AdminController {
    constructor(loginAdminUseCase, fetchAllUsersUseCase, blockUserUseCase, unblockUserUseCase, fetchRecruitersUseCase, approveRecruiterUseCase, adminDashboardUseCase, fetchJobPostsUseCase, blockJobPostUseCase, unblockJobPostUseCase, adminRepository, toggleUserPostBlockUseCase, postRepository, jwtAuthService) {
        this.loginAdminUseCase = loginAdminUseCase;
        this.fetchAllUsersUseCase = fetchAllUsersUseCase;
        this.blockUserUseCase = blockUserUseCase;
        this.unblockUserUseCase = unblockUserUseCase;
        this.fetchRecruitersUseCase = fetchRecruitersUseCase;
        this.approveRecruiterUseCase = approveRecruiterUseCase;
        this.adminDashboardUseCase = adminDashboardUseCase;
        this.fetchJobPostsUseCase = fetchJobPostsUseCase;
        this.blockJobPostUseCase = blockJobPostUseCase;
        this.unblockJobPostUseCase = unblockJobPostUseCase;
        this.adminRepository = adminRepository;
        this.toggleUserPostBlockUseCase = toggleUserPostBlockUseCase;
        this.postRepository = postRepository;
        this.jwtAuthService = jwtAuthService;
    }
    login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, password } = req.body;
                if (!email || !password) {
                    return res
                        .status(400)
                        .json({ error: "Email and password are required" });
                }
                const result = yield this.loginAdminUseCase.execute(email, password);
                res.status(200).json(result);
            }
            catch (error) {
                console.error("Error during admin login:", error);
                res.status(400).json({ error: error.message });
            }
        });
    }
    fetchUsers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const users = yield this.fetchAllUsersUseCase.execute();
                res.status(200).json(users);
            }
            catch (error) {
                console.error("Error fetching users:", error);
                res.status(500).json({ error: "Failed to fetch users" });
            }
        });
    }
    blockUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId } = req.params;
                const user = yield this.blockUserUseCase.execute(userId);
                if (!user) {
                    return res.status(404).json({ error: "User not found" });
                }
                res.status(200).json(user);
            }
            catch (error) {
                console.error("Error blocking user:", error);
                res.status(500).json({ error: "Failed to block user" });
            }
        });
    }
    unblockUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId } = req.params;
                const user = yield this.unblockUserUseCase.execute(userId);
                if (!user) {
                    return res.status(404).json({ error: "User not found" });
                }
                res.status(200).json(user);
            }
            catch (error) {
                console.error("Error unblocking user:", error);
                res.status(500).json({ error: "Failed to unblock user" });
            }
        });
    }
    fetchRecruiters(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const recruiters = yield this.fetchRecruitersUseCase.execute();
                res.status(200).json(recruiters);
            }
            catch (error) {
                console.error("Error fetching recruiters:", error);
                res.status(500).json({ error: "Failed to fetch recruiters" });
            }
        });
    }
    approveRecruiter(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const recruiter = yield this.approveRecruiterUseCase.execute(id);
                if (!recruiter) {
                    return res.status(404).json({ error: "Recruiter not found" });
                }
                res.status(200).json(recruiter);
            }
            catch (error) {
                console.error("Error approving recruiter:", error);
                res.status(500).json({ error: "Failed to approve recruiter" });
            }
        });
    }
    dashboard(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield this.adminDashboardUseCase.execute();
                res.status(200).json(data);
            }
            catch (error) {
                console.error("Error loading admin dashboard:", error);
                res.status(500).json({ error: "Failed to load admin dashboard" });
            }
        });
    }
    fetchJobPosts(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const jobPosts = yield this.fetchJobPostsUseCase.execute();
                res.status(200).json(jobPosts);
            }
            catch (error) {
                console.error("Error fetching job posts:", error);
                res.status(500).json({ error: "Failed to fetch job posts" });
            }
        });
    }
    blockJobPost(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { postId } = req.params;
                const jobPost = yield this.blockJobPostUseCase.execute(postId);
                if (!jobPost) {
                    return res.status(404).json({ error: "Job post not found" });
                }
                res.status(200).json(jobPost);
            }
            catch (error) {
                console.error("Error blocking job post:", error);
                res.status(500).json({ error: "Failed to block job post" });
            }
        });
    }
    unblockJobPost(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { postId } = req.params;
                const jobPost = yield this.unblockJobPostUseCase.execute(postId);
                if (!jobPost) {
                    return res.status(404).json({ error: "Job post not found" });
                }
                res.status(200).json(jobPost);
            }
            catch (error) {
                console.error("Error unblocking job post:", error);
                res.status(500).json({ error: "Failed to unblock job post" });
            }
        });
    }
    getSubscriptions(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 10;
                const result = yield this.adminRepository.getSubscriptions(page, limit);
                res.status(200).json(result);
            }
            catch (error) {
                console.error("Error fetching subscriptions:", error);
                res.status(500).json({ error: "Failed to fetch subscriptions" });
            }
        });
    }
    cancelSubscription(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { recruiterId } = req.params;
                const updatedRecruiter = yield this.adminRepository.cancelSubscription(recruiterId);
                if (updatedRecruiter) {
                    res.status(200).json({
                        message: "Subscription cancelled successfully",
                        recruiter: updatedRecruiter,
                    });
                }
                else {
                    res.status(404).json({ error: "Recruiter not found" });
                }
            }
            catch (error) {
                console.error("Error cancelling subscription:", error);
                res.status(500).json({ error: "Failed to cancel subscription" });
            }
        });
    }
    getUserPosts(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 10;
                const result = yield this.postRepository.findAllAdmin(page, limit);
                const userPosts = result.posts.map((post) => {
                    var _a, _b;
                    return ({
                        id: post._id,
                        userName: ((_a = post.user) === null || _a === void 0 ? void 0 : _a.name) || "Unknown",
                        userEmail: ((_b = post.user) === null || _b === void 0 ? void 0 : _b.email) || "Unknown",
                        content: post.content,
                        imageUrl: post.imageUrl,
                        videoUrl: post.videoUrl,
                        isBlocked: post.status === "blocked",
                    });
                });
                res.status(200).json({
                    userPosts,
                    totalPages: result.totalPages,
                    currentPage: result.currentPage,
                });
            }
            catch (error) {
                console.error("Error fetching user posts:", error);
                res.status(500).json({ error: "Failed to fetch user posts" });
            }
        });
    }
    toggleUserPostBlock(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { postId } = req.params;
                const updatedPost = yield this.toggleUserPostBlockUseCase.execute(postId);
                res.status(200).json({
                    id: updatedPost._id,
                    isBlocked: updatedPost.status === "blocked",
                });
            }
            catch (error) {
                console.error("Error toggling user post block status:", error);
                res
                    .status(500)
                    .json({ error: "Failed to toggle user post block status" });
            }
        });
    }
    refreshAdminToken(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { refreshToken } = req.body;
                const decoded = this.jwtAuthService.verifyToken(refreshToken);
                const admin = yield this.adminRepository.findById(decoded.id);
                if (!admin || admin.role !== 'admin') {
                    return res.status(404).json({ error: 'Admin not found' });
                }
                const newToken = this.jwtAuthService.generateToken(admin);
                res.json({ token: newToken, admin });
            }
            catch (error) {
                console.error('Error refreshing admin token:', error);
                res.status(401).json({ error: 'Invalid refresh token' });
            }
        });
    }
};
exports.AdminController = AdminController;
exports.AdminController = AdminController = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.default.LoginAdminUseCase)),
    __param(1, (0, inversify_1.inject)(types_1.default.FetchAllUsersUseCase)),
    __param(2, (0, inversify_1.inject)(types_1.default.BlockUserUseCase)),
    __param(3, (0, inversify_1.inject)(types_1.default.UnblockUserUseCase)),
    __param(4, (0, inversify_1.inject)(types_1.default.FetchRecruitersUseCase)),
    __param(5, (0, inversify_1.inject)(types_1.default.ApproveRecruiterUseCase)),
    __param(6, (0, inversify_1.inject)(types_1.default.AdminDashboardUseCase)),
    __param(7, (0, inversify_1.inject)(types_1.default.FetchJobPostsUseCase)),
    __param(8, (0, inversify_1.inject)(types_1.default.BlockJobPostUseCase)),
    __param(9, (0, inversify_1.inject)(types_1.default.UnblockJobPostUseCase)),
    __param(10, (0, inversify_1.inject)(types_1.default.IAdminRepository)),
    __param(11, (0, inversify_1.inject)(types_1.default.ToggleUserPostBlockUseCase)),
    __param(12, (0, inversify_1.inject)(types_1.default.IPostRepository)),
    __param(13, (0, inversify_1.inject)(types_1.default.JwtAuthService)),
    __metadata("design:paramtypes", [LoginAdminUseCase_1.LoginAdminUseCase,
        FetchAllUsersUseCase_1.FetchAllUsersUseCase,
        BlockUserUseCase_1.BlockUserUseCase,
        UnblockUserUseCase_1.UnblockUserUseCase,
        FetchRecruitersUseCase_1.FetchRecruitersUseCase,
        ApproveRecruiterUseCase_1.ApproveRecruiterUseCase,
        AdminDashboardUseCase_1.AdminDashboardUseCase,
        FetchJobPostsUseCase_1.FetchJobPostsUseCase,
        BlockJobPostUseCase_1.BlockJobPostUseCase,
        UnblockJobPostUseCase_1.UnblockJobPostUseCase, Object, ToggleUserPostBlockUseCase_1.ToggleUserPostBlockUseCase, Object, JwtAuthService_1.JwtAuthService])
], AdminController);
