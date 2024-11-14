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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoUserRepository = void 0;
const inversify_1 = require("inversify");
const UserModel_1 = require("../../mongoose/models/UserModel");
let MongoUserRepository = class MongoUserRepository {
    findByUserId(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield UserModel_1.UserModel.findById(userId).lean();
            return user ? this.mapToUser(user) : null;
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield UserModel_1.UserModel.findById(id).lean();
            return user ? this.mapToUser(user) : null;
        });
    }
    findByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield UserModel_1.UserModel.findOne({ email }).lean();
            return user ? this.mapToUser(user) : null;
        });
    }
    create(user) {
        return __awaiter(this, void 0, void 0, function* () {
            const newUser = new UserModel_1.UserModel(user);
            yield newUser.save();
            return this.mapToUser(newUser.toObject());
        });
    }
    update(id, user) {
        return __awaiter(this, void 0, void 0, function* () {
            const updatedUser = yield UserModel_1.UserModel.findByIdAndUpdate(id, user, {
                new: true,
            }).lean();
            return updatedUser ? this.mapToUser(updatedUser) : null;
        });
    }
    updateAppliedJobs(id, jobPostId) {
        return __awaiter(this, void 0, void 0, function* () {
            const updatedUser = yield UserModel_1.UserModel.findByIdAndUpdate(id, { $addToSet: { appliedJobs: jobPostId } }, { new: true }).lean();
            return updatedUser ? this.mapToUser(updatedUser) : null;
        });
    }
    searchUsers(query, userIds) {
        return __awaiter(this, void 0, void 0, function* () {
            const users = yield UserModel_1.UserModel.find({
                _id: { $in: userIds },
                $or: [
                    { name: { $regex: query, $options: 'i' } },
                    { email: { $regex: query, $options: 'i' } }
                ]
            }).limit(20);
            return users.map(this.mapToUser);
        });
    }
    // New method
    findUsersByIds(userIds) {
        return __awaiter(this, void 0, void 0, function* () {
            const users = yield UserModel_1.UserModel.find({ _id: { $in: userIds } }).lean();
            return users.map(this.mapToUser);
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
            phone: doc.phone,
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
    updatePassword(id, newPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            yield UserModel_1.UserModel.findByIdAndUpdate(id, { password: newPassword });
        });
    }
};
exports.MongoUserRepository = MongoUserRepository;
exports.MongoUserRepository = MongoUserRepository = __decorate([
    (0, inversify_1.injectable)()
], MongoUserRepository);
