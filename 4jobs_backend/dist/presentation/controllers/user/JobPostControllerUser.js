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
exports.JobPostControllerUser = void 0;
const inversify_1 = require("inversify");
const types_1 = __importDefault(require("../../../types"));
const ApplyForJobUseCase_1 = require("../../../application/usecases/auth/ApplyForJobUseCase");
const GetJobPostByIdUseCase_1 = require("../../../application/usecases/auth/GetJobPostByIdUseCase");
const GetJobPostsUseCase_1 = require("../../../application/usecases/auth/GetJobPostsUseCase");
let JobPostControllerUser = class JobPostControllerUser {
    constructor(applyForJobUseCase, getJobPostByIdUseCase, getJobPostsUseCase) {
        this.applyForJobUseCase = applyForJobUseCase;
        this.getJobPostByIdUseCase = getJobPostByIdUseCase;
        this.getJobPostsUseCase = getJobPostsUseCase;
    }
    // Fetch all job posts
    getJobPosts(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 10;
                const sortBy = req.query.sortBy || "createdAt";
                const sortOrder = req.query.sortOrder || "desc";
                const filter = req.query.filter
                    ? Object.assign(Object.assign({}, JSON.parse(req.query.filter)), { status: "Open" }) : { status: "Open" };
                const result = yield this.getJobPostsUseCase.execute(page, limit, sortBy, sortOrder, filter);
                res.status(200).json({
                    jobPosts: result.jobPosts,
                    currentPage: page,
                    totalPages: result.totalPages,
                    totalCount: result.totalCount,
                });
            }
            catch (error) {
                console.error("Error fetching job posts:", error);
                res.status(500).json({ error: "Failed to fetch job posts" });
            }
        });
    }
    // Fetch job post by ID
    getJobPostById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const jobPostId = req.params.id;
                const jobPost = yield this.getJobPostByIdUseCase.execute(jobPostId);
                if (!jobPost) {
                    return res.status(404).json({ error: "Job post not found" });
                }
                res.status(200).json(jobPost);
            }
            catch (error) {
                console.error("Error fetching job post:", error);
                res.status(500).json({ error: "Failed to fetch job post" });
            }
        });
    }
    // Apply for a job post
    applyForJob(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId } = req.body;
                const { jobId } = req.params;
                const result = yield this.applyForJobUseCase.execute(userId, jobId);
                console.log("apply", result);
                res.status(200).json(result);
            }
            catch (error) {
                console.error("Error applying for job:", error.message);
                // If it's a known error (business logic error), return 400 (Bad Request)
                if (error.message === "User not found" || error.message === "Job post not found" || error.message === "Already applied for this job") {
                    return res.status(400).json({ error: error.message });
                }
                // Otherwise, return 500 (Internal Server Error)
                res.status(500).json({ message: "An unexpected error occurred" });
            }
        });
    }
};
exports.JobPostControllerUser = JobPostControllerUser;
exports.JobPostControllerUser = JobPostControllerUser = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.default.ApplyForJobUseCase)),
    __param(1, (0, inversify_1.inject)(types_1.default.GetJobPostByIdUseCase)),
    __param(2, (0, inversify_1.inject)(types_1.default.GetJobPostsUseCase)),
    __metadata("design:paramtypes", [ApplyForJobUseCase_1.ApplyForJobUseCase,
        GetJobPostByIdUseCase_1.GetJobPostByIdUseCase,
        GetJobPostsUseCase_1.GetJobPostsUseCase])
], JobPostControllerUser);