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
exports.MongoSearchRepository = void 0;
const inversify_1 = require("inversify");
const UserModel_1 = require("../models/UserModel");
const jobPostModel_1 = __importDefault(require("../models/jobPostModel"));
const ConnectionModel_1 = require("../models/ConnectionModel");
const mongoose_1 = __importDefault(require("mongoose"));
let MongoSearchRepository = class MongoSearchRepository {
    searchUsersAndJobs(query, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const userDocs = yield UserModel_1.UserModel.find({
                $or: [
                    { name: { $regex: query, $options: "i" } },
                    { email: { $regex: query, $options: "i" } },
                ],
                _id: { $ne: new mongoose_1.default.Types.ObjectId(userId) },
                isBlocked: { $ne: true },
            }).limit(10);
            const jobPostDocs = yield jobPostModel_1.default.find({
                $or: [
                    { title: { $regex: query, $options: "i" } },
                    { "company.name": { $regex: query, $options: "i" } },
                    { location: { $regex: query, $options: "i" } },
                    { skillsRequired: { $in: [new RegExp(query, "i")] } },
                    { qualifications: { $in: [new RegExp(query, "i")] } },
                ],
                isBlock: { $ne: true },
            }).limit(10);
            const connections = yield ConnectionModel_1.ConnectionModel.find({
                $or: [
                    { requester: new mongoose_1.default.Types.ObjectId(userId) },
                    { recipient: new mongoose_1.default.Types.ObjectId(userId) },
                ],
                status: ["accepted", "pending"],
            });
            const connectedUserIds = connections.map((conn) => conn.requester.toString() === userId
                ? conn.recipient.toString()
                : conn.requester.toString());
            const searchResults = yield UserModel_1.UserModel.find({
                $or: [
                    { name: { $regex: query, $options: "i" } },
                    { email: { $regex: query, $options: "i" } },
                    { skills: { $elemMatch: { $regex: query, $options: "i" } } },
                ],
            })
                .limit(10)
                .skip(0);
            const results = yield Promise.all(searchResults.map((doc) => __awaiter(this, void 0, void 0, function* () {
                const isConnected = connectedUserIds.includes(doc._id.toString());
                return {
                    id: doc._id.toString(),
                    email: doc.email,
                    name: doc.name,
                    profileImage: doc.profileImage,
                    isConnected,
                    isBlocked: doc.isBlocked,
                };
            })));
            const users = results.map((result) => result);
            const jobPosts = jobPostDocs.map((doc) => {
                var _a, _b;
                const isApplied = ((_a = doc.applicants) === null || _a === void 0 ? void 0 : _a.some((applicant) => applicant.toString() === userId)) ||
                    false;
                return {
                    _id: doc._id.toString(),
                    title: doc.title,
                    description: doc.description,
                    company: doc.company,
                    location: doc.location,
                    salaryRange: doc.salaryRange,
                    wayOfWork: doc.wayOfWork,
                    skillsRequired: doc.skillsRequired,
                    qualifications: doc.qualifications,
                    status: doc.status,
                    recruiterId: doc.recruiterId.toString(),
                    applicants: ((_b = doc.applicants) === null || _b === void 0 ? void 0 : _b.map((id) => id.toString())) || [],
                    reports: doc.reports,
                    isBlock: doc.isBlock,
                    createdAt: doc.createdAt,
                    updatedAt: doc.updatedAt,
                    isApplied,
                };
            });
            return { users, jobPosts };
        });
    }
};
exports.MongoSearchRepository = MongoSearchRepository;
exports.MongoSearchRepository = MongoSearchRepository = __decorate([
    (0, inversify_1.injectable)()
], MongoSearchRepository);
