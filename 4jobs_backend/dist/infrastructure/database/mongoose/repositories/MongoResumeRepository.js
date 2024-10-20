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
exports.MongoResumeRepository = void 0;
const inversify_1 = require("inversify");
const Resume_1 = require("../../../../domain/entities/Resume");
const ResumeModel_1 = require("../models/ResumeModel");
let MongoResumeRepository = class MongoResumeRepository {
    create(userId, resumeUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            const resume = yield ResumeModel_1.ResumeModel.create({ user: userId, resumeUrl });
            return this.mapToEntity(resume);
        });
    }
    findByUserId(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const resume = yield ResumeModel_1.ResumeModel.findOne({ user: userId }).populate('user');
            return resume ? this.mapToEntity(resume) : null;
        });
    }
    update(id, resumeUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            const resume = yield ResumeModel_1.ResumeModel.findByIdAndUpdate(id, { resumeUrl, updatedAt: new Date() }, { new: true }).populate('user');
            if (!resume) {
                throw new Error("Resume not found");
            }
            return this.mapToEntity(resume);
        });
    }
    mapToEntity(resumeDoc) {
        return new Resume_1.Resume(resumeDoc._id.toString(), resumeDoc.user, resumeDoc.resumeUrl, resumeDoc.createdAt, resumeDoc.updatedAt);
    }
};
exports.MongoResumeRepository = MongoResumeRepository;
exports.MongoResumeRepository = MongoResumeRepository = __decorate([
    (0, inversify_1.injectable)()
], MongoResumeRepository);
