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
let MongoAdminRepository = class MongoAdminRepository {
    findAllUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            const usersList = yield UserModel_1.UserModel.find({ isAdmin: false }).exec();
            // Map each document to ensure `id` is correctly mapped from `_id`
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
    save(recruiter) {
        return __awaiter(this, void 0, void 0, function* () {
            const updatedRecruiter = yield RecruiterModel_1.default.findByIdAndUpdate(recruiter.id, recruiter, { new: true }).exec();
            return updatedRecruiter;
        });
    }
    findRecruiters() {
        return __awaiter(this, void 0, void 0, function* () {
            const recruiters = yield RecruiterModel_1.default.find().exec();
            return recruiters;
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
};
exports.MongoAdminRepository = MongoAdminRepository;
exports.MongoAdminRepository = MongoAdminRepository = __decorate([
    (0, inversify_1.injectable)()
], MongoAdminRepository);