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
exports.JobPostUseCase = void 0;
const inversify_1 = require("inversify");
const types_1 = __importDefault(require("../../../types"));
let JobPostUseCase = class JobPostUseCase {
    constructor(jobPostRepository, userRepository) {
        this.jobPostRepository = jobPostRepository;
        this.userRepository = userRepository;
    }
    getApplicantsByJobId(jobId, page, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.jobPostRepository.findApplicantsByJobId(jobId, page, limit);
        });
    }
    createJobPost(params) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.jobPostRepository.create(params);
        });
    }
    getJobPostById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.jobPostRepository.findById(id);
        });
    }
    getApplicantsById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.userRepository.findById(id);
        });
    }
    getJobPostsByRecruiterId(recruiterId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.jobPostRepository.findByRecruiterId(recruiterId);
        });
    }
    updateJobPost(id, params) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.jobPostRepository.update(id, params);
        });
    }
    deleteJobPost(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.jobPostRepository.delete(id);
        });
    }
    getAllJobPosts() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.jobPostRepository.findAll();
        });
    }
};
exports.JobPostUseCase = JobPostUseCase;
exports.JobPostUseCase = JobPostUseCase = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.default.JobPostRepository)),
    __param(1, (0, inversify_1.inject)(types_1.default.IUserRepository)),
    __metadata("design:paramtypes", [Object, Object])
], JobPostUseCase);
