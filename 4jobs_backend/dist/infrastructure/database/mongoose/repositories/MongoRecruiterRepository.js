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
exports.MongoRecruiterRepository = void 0;
const RecruiterModel_1 = __importDefault(require("../models/RecruiterModel"));
const inversify_1 = require("inversify");
let MongoRecruiterRepository = class MongoRecruiterRepository {
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
    create(recruiterData) {
        return __awaiter(this, void 0, void 0, function* () {
            const recruiter = new RecruiterModel_1.default(recruiterData);
            const savedRecruiter = yield recruiter.save();
            return this.mapToIRecruiter(savedRecruiter);
        });
    }
    findRecruiterByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const recruiter = yield RecruiterModel_1.default.findOne({ email }).exec();
            return recruiter;
        });
    }
    findByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.findRecruiterByEmail(email);
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
            return this.mapToIRecruiter(updatedRecruiter);
        });
    }
    findRecruiters() {
        return __awaiter(this, void 0, void 0, function* () {
            const recruiters = yield RecruiterModel_1.default.find().exec();
            return recruiters.map(this.mapToIRecruiter);
        });
    }
    updateRecruiter(id, updates) {
        return __awaiter(this, void 0, void 0, function* () {
            if (updates.location === undefined) {
                throw new Error("Location is required for updating the profile");
            }
            const updatedRecruiter = yield RecruiterModel_1.default.findByIdAndUpdate(id, updates, {
                new: true,
            }).exec();
            return updatedRecruiter;
        });
    }
    findRecruiterById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const recruiter = yield RecruiterModel_1.default.findById(id).exec();
            return recruiter;
        });
    }
    updateSubscription(id, subscriptionData) {
        return __awaiter(this, void 0, void 0, function* () {
            const updatedRecruiter = yield RecruiterModel_1.default.findByIdAndUpdate(id, { $set: subscriptionData }, { new: true }).exec();
            return updatedRecruiter ? this.mapToIRecruiter(updatedRecruiter) : null;
        });
    }
};
exports.MongoRecruiterRepository = MongoRecruiterRepository;
exports.MongoRecruiterRepository = MongoRecruiterRepository = __decorate([
    (0, inversify_1.injectable)()
], MongoRecruiterRepository);
