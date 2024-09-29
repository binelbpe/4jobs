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
exports.ApplyForJobUseCase = void 0;
const inversify_1 = require("inversify");
const types_1 = __importDefault(require("../../../types"));
const mongodb_1 = require("mongodb"); // Import ObjectId from MongoDB
let ApplyForJobUseCase = class ApplyForJobUseCase {
    constructor(userRepository, jobPostRepository) {
        this.userRepository = userRepository;
        this.jobPostRepository = jobPostRepository;
    }
    execute(userId, jobId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const user = yield this.userRepository.findById(userId);
            if (!user)
                throw new Error("User not found");
            const jobPost = yield this.jobPostRepository.findById(jobId);
            if (!jobPost)
                throw new Error("Job post not found");
            // Convert jobId and userId to ObjectId if needed
            const jobObjectId = new mongodb_1.ObjectId(jobId);
            const userObjectId = new mongodb_1.ObjectId(userId);
            console.log("job post applied===========================", user.appliedJobs);
            console.log("user applied===============================", jobPost.applicants);
            // Check if the job is already applied by the user
            const userHasApplied = (_a = user.appliedJobs) === null || _a === void 0 ? void 0 : _a.some((appliedJobId) => appliedJobId.toString() === jobObjectId.toString());
            // Check if the user is already an applicant for the job post
            const jobHasApplicant = (_b = jobPost.applicants) === null || _b === void 0 ? void 0 : _b.some((applicantId) => applicantId.toString() === userObjectId.toString());
            if (userHasApplied)
                throw new Error("Already applied for this job");
            if (jobHasApplicant)
                throw new Error("Already applied for this job");
            // Update user applied jobs
            let result = yield this.userRepository.updateAppliedJobs(userId, jobId);
            // Update job post applicants
            yield this.jobPostRepository.update(jobId, userId);
            return result;
        });
    }
};
exports.ApplyForJobUseCase = ApplyForJobUseCase;
exports.ApplyForJobUseCase = ApplyForJobUseCase = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.default.IUserRepository)),
    __param(1, (0, inversify_1.inject)(types_1.default.IJobPostUserRepository)),
    __metadata("design:paramtypes", [Object, Object])
], ApplyForJobUseCase);
