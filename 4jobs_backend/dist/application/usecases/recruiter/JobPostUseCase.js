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
const S3Service_1 = require("../../../infrastructure/services/S3Service");
const PDFExtractor_1 = require("../../../infrastructure/services/PDFExtractor");
let JobPostUseCase = class JobPostUseCase {
    constructor(jobPostRepository, userRepository, s3Service, pdfExtractor) {
        this.jobPostRepository = jobPostRepository;
        this.userRepository = userRepository;
        this.s3Service = s3Service;
        this.pdfExtractor = pdfExtractor;
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
    getFilteredApplicants(jobId) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`Starting getFilteredApplicants for jobId: ${jobId}`);
            const jobPost = yield this.jobPostRepository.findById(jobId);
            if (!jobPost) {
                console.log(`Job post not found for jobId: ${jobId}`);
                throw new Error("Job post not found");
            }
            console.log(`Job post found: ${JSON.stringify(jobPost)}`);
            const applicants = yield Promise.all((jobPost.applicants || []).map(id => this.userRepository.findById(id.toString())));
            console.log(`Found ${applicants.length} applicants`);
            const requiredSkills = jobPost.skillsRequired || [];
            console.log(`Required skills: ${JSON.stringify(requiredSkills)}`);
            const filteredApplicants = yield Promise.all(applicants.map((applicant) => __awaiter(this, void 0, void 0, function* () {
                if (!applicant || !applicant.resume) {
                    console.log(`Skipping applicant ${(applicant === null || applicant === void 0 ? void 0 : applicant.id) || 'unknown'}: No resume`);
                    return null;
                }
                try {
                    console.log(`Processing applicant ${applicant.id}`);
                    const resumeBuffer = yield this.s3Service.getFile(applicant.resume);
                    console.log(`Resume fetched for applicant ${applicant.id}. Buffer length: ${resumeBuffer.length}`);
                    const resumeText = yield this.pdfExtractor.extractText(resumeBuffer);
                    console.log(`Resume text extracted for applicant ${applicant.id}. Text length: ${resumeText.length}`);
                    console.log(`First 200 characters of resume text: ${resumeText.substring(0, 500)}`);
                    if (resumeText.trim().length === 0) {
                        console.log(`Skipping applicant ${applicant.id}: Empty resume text`);
                        return null;
                    }
                    const matchPercentage = this.calculateSkillMatch(requiredSkills, resumeText);
                    console.log(`Match percentage for applicant ${applicant.id}: ${matchPercentage}%`);
                    return matchPercentage >= 75 ? Object.assign(Object.assign({}, applicant), { matchPercentage }) : null;
                }
                catch (error) {
                    if (error instanceof Error) {
                        console.warn(`Failed to process resume for applicant ${applicant.id}: ${error.message}`);
                    }
                    else {
                        console.warn(`Failed to process resume for applicant ${applicant.id}: Unknown error`);
                    }
                    return null;
                }
            })));
            const result = filteredApplicants.filter((applicant) => applicant !== null);
            console.log(`Filtered applicants: ${result.length}`);
            return result;
        });
    }
    calculateSkillMatch(requiredSkills, resumeText) {
        const resumeWords = resumeText.toLowerCase().split(/\s+/);
        console.log(`Resume words: ${resumeWords.slice(0, 20).join(', ')}...`);
        const matchedSkills = requiredSkills.filter(skill => {
            const skillWords = skill.toLowerCase().split(/\s+/);
            const isMatched = skillWords.every(word => resumeWords.some(resumeWord => resumeWord.includes(word)));
            console.log(`Skill "${skill}" matched: ${isMatched}`);
            return isMatched;
        });
        const matchPercentage = (matchedSkills.length / requiredSkills.length) * 100;
        console.log(`Matched skills: ${matchedSkills.length}/${requiredSkills.length} (${matchPercentage}%)`);
        return matchPercentage;
    }
};
exports.JobPostUseCase = JobPostUseCase;
exports.JobPostUseCase = JobPostUseCase = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.default.JobPostRepository)),
    __param(1, (0, inversify_1.inject)(types_1.default.IUserRepository)),
    __param(2, (0, inversify_1.inject)(types_1.default.S3Service)),
    __param(3, (0, inversify_1.inject)(types_1.default.PDFExtractor)),
    __metadata("design:paramtypes", [Object, Object, S3Service_1.S3Service,
        PDFExtractor_1.PDFExtractor])
], JobPostUseCase);
