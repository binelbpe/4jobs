"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
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
exports.MongoJobPostUserRepository = void 0;
const inversify_1 = require("inversify");
const jobPostModel_1 = __importDefault(require("../models/jobPostModel"));
const mongoose_1 = __importDefault(require("mongoose"));
let MongoJobPostUserRepository = class MongoJobPostUserRepository {
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield jobPostModel_1.default.findOne({ _id: id, isBlock: false }).lean();
        });
    }
    update(id, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            let updatedJobPost = yield jobPostModel_1.default.findOneAndUpdate({ _id: id, isBlock: false }, { $addToSet: { applicants: userId } }, { new: true });
            return updatedJobPost;
        });
    }
    findAll(page, limit, sortBy, sortOrder, filter) {
        return __awaiter(this, void 0, void 0, function* () {
            const skip = (page - 1) * limit;
            const sort = {
                [sortBy]: sortOrder === "asc" ? 1 : -1,
            };
            // Add isBlock: false to the filter
            const blockFilter = Object.assign(Object.assign({}, filter), { isBlock: false });
            const totalCount = yield jobPostModel_1.default.countDocuments(blockFilter);
            const totalPages = Math.ceil(totalCount / limit);
            const jobPosts = yield jobPostModel_1.default.find(blockFilter)
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .lean();
            return {
                jobPosts: jobPosts,
                totalPages,
                totalCount,
            };
        });
    }
    reportJob(userId, jobId, reason) {
        return __awaiter(this, void 0, void 0, function* () {
            const updatedJobPost = yield jobPostModel_1.default.findByIdAndUpdate(jobId, {
                $push: {
                    reports: {
                        userId: new mongoose_1.default.Types.ObjectId(userId),
                        reason: reason,
                        createdAt: new Date()
                    }
                }
            }, { new: true });
            return updatedJobPost;
        });
    }
    advancedSearch(filters, page, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            const skip = (page - 1) * limit;
            const baseQuery = { isBlock: false, status: "Open" };
            // Function to check if a search term matches a target string
            const isMatch = (searchTerm, target) => {
                return target.toLowerCase().includes(searchTerm.toLowerCase());
            };
            // Function to calculate match percentage for all criteria
            const calculateMatchPercentage = (job) => {
                let matchedCriteria = 0;
                let totalCriteria = 0;
                // Check each filter criteria
                if (filters.title) {
                    totalCriteria++;
                    if (isMatch(filters.title, job.title)) {
                        matchedCriteria++;
                    }
                }
                if (filters.company) {
                    totalCriteria++;
                    if (isMatch(filters.company, job.company.name)) {
                        matchedCriteria++;
                    }
                }
                if (filters.location) {
                    totalCriteria++;
                    if (isMatch(filters.location, job.location)) {
                        matchedCriteria++;
                    }
                }
                if (filters.wayOfWork) {
                    totalCriteria++;
                    if (job.wayOfWork === filters.wayOfWork) {
                        matchedCriteria++;
                    }
                }
                // Check salary range
                if (filters.salaryMin || filters.salaryMax) {
                    totalCriteria++;
                    if ((!filters.salaryMin || job.salaryRange.max >= filters.salaryMin) &&
                        (!filters.salaryMax || job.salaryRange.min <= filters.salaryMax)) {
                        matchedCriteria++;
                    }
                }
                // Check skills - now with proper typing
                if (filters.skills && filters.skills.length > 0) {
                    totalCriteria++;
                    const matchedSkills = filters.skills.filter(searchSkill => job.skillsRequired.some((jobSkill) => isMatch(searchSkill, jobSkill)));
                    if (matchedSkills.length === filters.skills.length) {
                        matchedCriteria++;
                    }
                }
                // Calculate percentage only if there are criteria to match
                const percentage = totalCriteria > 0
                    ? (matchedCriteria / totalCriteria) * 100
                    : 0;
                return {
                    percentage: Math.round(percentage),
                    matchedCriteria,
                    totalCriteria
                };
            };
            // Get all jobs
            const allJobs = yield jobPostModel_1.default.find(baseQuery).lean();
            // Process and categorize jobs
            let exactMatches = [];
            let similarMatches = [];
            allJobs.forEach(job => {
                const result = calculateMatchPercentage(job);
                const jobWithMatch = Object.assign(Object.assign({}, job), { matchPercentage: result.percentage });
                if (result.matchedCriteria === result.totalCriteria && result.totalCriteria > 0) {
                    // All specified criteria match - Exact match
                    exactMatches.push(jobWithMatch);
                }
                else if (result.percentage >= 50) {
                    // 50% or more criteria match - Similar match
                    similarMatches.push(jobWithMatch);
                }
            });
            // Sort by match percentage
            exactMatches.sort((a, b) => b.matchPercentage - a.matchPercentage);
            similarMatches.sort((a, b) => b.matchPercentage - a.matchPercentage);
            // Apply pagination
            const paginatedExactMatches = exactMatches.slice(skip, skip + limit);
            const paginatedSimilarMatches = similarMatches.slice(skip, skip + limit);
            return {
                exactMatches: paginatedExactMatches.map(match => {
                    var _a;
                    return (Object.assign(Object.assign({}, match), { _id: ((_a = match._id) === null || _a === void 0 ? void 0 : _a.toString()) || undefined }));
                }),
                similarMatches: paginatedSimilarMatches.map(match => {
                    var _a;
                    return (Object.assign(Object.assign({}, match), { _id: ((_a = match._id) === null || _a === void 0 ? void 0 : _a.toString()) || undefined }));
                }),
                totalPages: Math.ceil(Math.max(exactMatches.length, similarMatches.length) / limit),
                currentPage: page,
                totalExactCount: exactMatches.length,
                totalSimilarCount: similarMatches.length
            };
        });
    }
};
exports.MongoJobPostUserRepository = MongoJobPostUserRepository;
exports.MongoJobPostUserRepository = MongoJobPostUserRepository = __decorate([
    (0, inversify_1.injectable)()
], MongoJobPostUserRepository);
