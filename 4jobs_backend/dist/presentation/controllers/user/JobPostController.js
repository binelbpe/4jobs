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
let JobPostControllerUser = class JobPostControllerUser {
    constructor(jobPostRepository) {
        this.jobPostRepository = jobPostRepository;
    }
    getJobPosts(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 10;
                const sortBy = req.query.sortBy || 'createdAt';
                const sortOrder = req.query.sortOrder || 'desc';
                const filter = req.query.filter ? JSON.parse(req.query.filter) : {};
                const result = yield this.jobPostRepository.findAll(page, limit, sortBy, sortOrder, filter);
                res.status(200).json({
                    jobPosts: result.jobPosts,
                    currentPage: page,
                    totalPages: result.totalPages,
                    totalCount: result.totalCount
                });
            }
            catch (error) {
                console.error('Error fetching job posts:', error);
                res.status(500).json({ error: 'Failed to fetch job posts' });
            }
        });
    }
    getJobPostById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const jobPostId = req.params.id;
                const jobPost = yield this.jobPostRepository.findById(jobPostId);
                if (!jobPost) {
                    return res.status(404).json({ error: 'Job post not found' });
                }
                res.status(200).json(jobPost);
            }
            catch (error) {
                console.error('Error fetching job post:', error);
                res.status(500).json({ error: 'Failed to fetch job post' });
            }
        });
    }
};
exports.JobPostControllerUser = JobPostControllerUser;
exports.JobPostControllerUser = JobPostControllerUser = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.default.JobPostRepository)),
    __metadata("design:paramtypes", [Object])
], JobPostControllerUser);
