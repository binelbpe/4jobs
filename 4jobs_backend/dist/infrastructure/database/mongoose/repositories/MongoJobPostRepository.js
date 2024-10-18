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
exports.MongoJobPostRepository = void 0;
const inversify_1 = require("inversify");
const jobPostModel_1 = __importDefault(require("../models/jobPostModel"));
const UserModel_1 = require("../models/UserModel");
let MongoJobPostRepository = class MongoJobPostRepository {
    create(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const jobPost = new jobPostModel_1.default(params);
            return yield jobPost.save();
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield jobPostModel_1.default.findById(id).lean();
        });
    }
    findByRecruiterId(recruiterId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield jobPostModel_1.default.find({ recruiterId });
        });
    }
    update(id, params) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield jobPostModel_1.default.findByIdAndUpdate(id, params, { new: true });
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield jobPostModel_1.default.findByIdAndDelete(id);
            return !!result;
        });
    }
    findApplicantsByJobId(jobId, page, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const skip = (page - 1) * limit;
            const jobPost = yield jobPostModel_1.default.findById(jobId).lean();
            if (!jobPost || !jobPost.applicants) {
                throw new Error("Job post or applicants not found");
            }
            const totalCount = ((_a = jobPost.applicants) === null || _a === void 0 ? void 0 : _a.length) || 0;
            const totalPages = Math.ceil(totalCount / limit);
            const applicantIds = ((_b = jobPost.applicants) === null || _b === void 0 ? void 0 : _b.slice(skip, skip + limit)) || [];
            const applicants = yield UserModel_1.UserModel.find({
                _id: { $in: applicantIds },
            }).lean();
            return {
                applicants: applicants.map(this.mapToUser),
                totalPages,
                totalCount,
            };
        });
    }
    mapToUser(doc) {
        return {
            id: doc._id.toString(),
            email: doc.email,
            name: doc.name,
            bio: doc.bio,
            about: doc.about,
            experiences: doc.experiences || [],
            projects: doc.projects || [],
            certificates: doc.certificates || [],
            skills: doc.skills || [],
            profileImage: doc.profileImage,
            dateOfBirth: doc.dateOfBirth,
            gender: doc.gender,
            resume: doc.resume,
            password: doc.password || "",
            role: doc.role || "",
            isAdmin: doc.isAdmin || false,
        };
    }
    findAll() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield jobPostModel_1.default.find({ isBlock: false }).lean();
        });
    }
};
exports.MongoJobPostRepository = MongoJobPostRepository;
exports.MongoJobPostRepository = MongoJobPostRepository = __decorate([
    (0, inversify_1.injectable)()
], MongoJobPostRepository);
