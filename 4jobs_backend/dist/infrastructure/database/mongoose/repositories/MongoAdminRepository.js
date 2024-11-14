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
exports.MongoAdminRepository = void 0;
const inversify_1 = require("inversify");
const UserModel_1 = require("../../mongoose/models/UserModel");
const RecruiterModel_1 = __importDefault(require("../models/RecruiterModel"));
const jobPostModel_1 = __importDefault(require("../models/jobPostModel"));
const PostModel_1 = __importDefault(require("../models/PostModel"));
let MongoAdminRepository = class MongoAdminRepository {
    findAllUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            const usersList = yield UserModel_1.UserModel.find({ isAdmin: false }).exec();
            const mappedUsers = usersList.map(this.mapToUser);
            return mappedUsers;
        });
    }
    blockUserById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const updatedUser = yield UserModel_1.UserModel.findByIdAndUpdate(id, { isBlocked: true }, { new: true });
            return updatedUser ? this.mapToUser(updatedUser) : null;
        });
    }
    unBlockUserById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const updatedUser = yield UserModel_1.UserModel.findByIdAndUpdate(id, { isBlocked: false }, { new: true });
            return updatedUser ? this.mapToUser(updatedUser) : null;
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const recruiter = yield RecruiterModel_1.default.findById(id).exec();
            return recruiter;
        });
    }
    mapToUser(doc) {
        return {
            id: doc._id.toString(),
            email: doc.email,
            password: doc.password,
            name: doc.name,
            role: doc.role,
            isAdmin: doc.isAdmin,
            bio: doc.bio,
            about: doc.about,
            experiences: doc.experiences || [],
            projects: doc.projects || [],
            certificates: doc.certificates || [],
            skills: doc.skills || [],
            appliedJobs: doc.appliedJobs || [],
            profileImage: doc.profileImage,
            dateOfBirth: doc.dateOfBirth,
            gender: doc.gender,
            resume: doc.resume,
            isBlocked: doc.isBlocked,
        };
    }
    mapToIRecruiter(doc) {
        return {
            id: doc._id.toString(),
            email: doc.email,
            password: doc.password,
            companyName: doc.companyName,
            phone: doc.phone,
            name: doc.name,
            role: doc.role,
            isApproved: doc.isApproved,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
            governmentId: doc.governmentId,
            employeeId: doc.employeeId,
            location: doc.location,
            employeeIdImage: doc.employeeIdImage,
            subscribed: doc.subscribed,
            planDuration: doc.planDuration,
            expiryDate: doc.expiryDate,
            subscriptionAmount: doc.subscriptionAmount,
            subscriptionStartDate: doc.subscriptionStartDate,
        };
    }
    save(recruiter) {
        return __awaiter(this, void 0, void 0, function* () {
            const updatedRecruiter = yield RecruiterModel_1.default.findByIdAndUpdate(recruiter.id, recruiter, { new: true }).exec();
            return this.mapToIRecruiter(updatedRecruiter);
        });
    }
    findRecruiters() {
        return __awaiter(this, void 0, void 0, function* () {
            const recruiters = yield RecruiterModel_1.default.find().exec();
            return recruiters.map(this.mapToIRecruiter);
        });
    }
    getUserCount() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield UserModel_1.UserModel.countDocuments({ role: "user" });
        });
    }
    getRecruiterCount() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield RecruiterModel_1.default.countDocuments();
        });
    }
    getCompanyCount() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const uniqueCompanies = yield RecruiterModel_1.default.aggregate([
                {
                    $group: {
                        _id: "$companyName",
                        count: { $sum: 1 },
                    },
                },
                {
                    $group: {
                        _id: null,
                        totalUniqueCompanies: { $sum: 1 },
                    },
                },
            ]);
            return ((_a = uniqueCompanies[0]) === null || _a === void 0 ? void 0 : _a.totalUniqueCompanies) || 0;
        });
    }
    getTotalRevenue() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const result = yield RecruiterModel_1.default.aggregate([
                {
                    $match: { subscribed: true },
                },
                {
                    $group: {
                        _id: null,
                        totalRevenue: { $sum: "$subscriptionAmount" },
                    },
                },
            ]);
            return ((_a = result[0]) === null || _a === void 0 ? void 0 : _a.totalRevenue) || 0;
        });
    }
    getMonthlyRevenue() {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield RecruiterModel_1.default.aggregate([
                {
                    $match: { subscribed: true },
                },
                {
                    $group: {
                        _id: {
                            $dateToString: { format: "%Y-%m", date: "$subscriptionStartDate" },
                        },
                        amount: { $sum: "$subscriptionAmount" },
                    },
                },
                {
                    $sort: { _id: 1 },
                },
                {
                    $project: {
                        _id: 0,
                        month: "$_id",
                        amount: 1,
                    },
                },
            ]);
            return result;
        });
    }
    getJobPostCount() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield jobPostModel_1.default.countDocuments();
        });
    }
    getUserPostCount() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield PostModel_1.default.countDocuments();
        });
    }
    getSubscriptions(page, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            const totalCount = yield RecruiterModel_1.default.countDocuments({ subscribed: true });
            const totalPages = Math.ceil(totalCount / limit);
            const skip = (page - 1) * limit;
            const recruiters = yield RecruiterModel_1.default.find({ subscribed: true })
                .skip(skip)
                .limit(limit)
                .exec();
            return {
                subscriptions: recruiters.map(this.mapToIRecruiter),
                totalPages,
                currentPage: page,
            };
        });
    }
    cancelSubscription(recruiterId) {
        return __awaiter(this, void 0, void 0, function* () {
            const updatedRecruiter = yield RecruiterModel_1.default.findByIdAndUpdate(recruiterId, {
                subscribed: false,
                planDuration: null,
                expiryDate: null,
                subscriptionAmount: 0,
                subscriptionStartDate: null,
            }, { new: true }).exec();
            return updatedRecruiter ? this.mapToIRecruiter(updatedRecruiter) : null;
        });
    }
};
exports.MongoAdminRepository = MongoAdminRepository;
exports.MongoAdminRepository = MongoAdminRepository = __decorate([
    (0, inversify_1.injectable)()
], MongoAdminRepository);
