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
exports.JobPostController = void 0;
const inversify_1 = require("inversify");
const types_1 = __importDefault(require("../../../types"));
const JobPostUseCase_1 = require("../../../application/usecases/recruiter/JobPostUseCase");
let JobPostController = class JobPostController {
    constructor(jobPostUseCase) {
        this.jobPostUseCase = jobPostUseCase;
    }
    createJobPost(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const recruiterId = req.params.id; // Get recruiterId from route params
                const jobPostData = Object.assign(Object.assign({}, req.body), { recruiterId }); // Combine body data with recruiterId
                const jobPost = yield this.jobPostUseCase.createJobPost(jobPostData);
                res.status(201).json(jobPost);
            }
            catch (error) {
                console.error('Error in createJobPost:', error);
                res.status(500).json({ error: 'Failed to create job post' });
            }
        });
    }
    getJobPostById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const jobPost = yield this.jobPostUseCase.getJobPostById(req.params.id);
                if (jobPost && !jobPost.isBlock) {
                    res.json(jobPost);
                }
                else {
                    res.status(404).json({ error: 'Job post not found or blocked' });
                }
            }
            catch (error) {
                res.status(500).json({ error: 'Failed to fetch job post' });
            }
        });
    }
    getJobPostsByRecruiterId(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const jobPosts = yield this.jobPostUseCase.getJobPostsByRecruiterId(req.params.recruiterId);
                res.json(jobPosts);
            }
            catch (error) {
                res.status(500).json({ error: 'Failed to fetch job posts' });
            }
        });
    }
    updateJobPost(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const updatedJobPost = yield this.jobPostUseCase.updateJobPost(req.params.id, req.body);
                console.log(req.body);
                if (updatedJobPost) {
                    res.json(updatedJobPost);
                }
                else {
                    res.status(404).json({ error: 'Job post not found' });
                }
            }
            catch (error) {
                console.error('Error in createJobPost:', error);
                res.status(500).json({ error: 'Failed to update job post' });
            }
        });
    }
    deleteJobPost(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.jobPostUseCase.deleteJobPost(req.params.id);
                if (result) {
                    res.status(204).send();
                }
                else {
                    res.status(404).json({ error: 'Job post not found' });
                }
            }
            catch (error) {
                res.status(500).json({ error: 'Failed to delete job post' });
            }
        });
    }
    getApplicantsByJobId(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { jobId } = req.params;
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 10;
                console.log("jobuid page limit", jobId, page, limit);
                const result = yield this.jobPostUseCase.getApplicantsByJobId(jobId, page, limit);
                res.json(result);
            }
            catch (error) {
                console.error('Error in getApplicantsByJobId:', error);
                res.status(500).json({ error: 'Failed to fetch applicants' });
            }
        });
    }
    getApplicantsById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { applicantId } = req.params;
                const result = yield this.jobPostUseCase.getApplicantsById(applicantId);
                res.json({ user: result });
            }
            catch (error) {
                console.error('Error in getApplicantsById:', error);
                res.status(500).json({ error: 'Failed to fetch applicant' });
            }
        });
    }
};
exports.JobPostController = JobPostController;
exports.JobPostController = JobPostController = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.default.JobPostUseCase)),
    __metadata("design:paramtypes", [JobPostUseCase_1.JobPostUseCase])
], JobPostController);
