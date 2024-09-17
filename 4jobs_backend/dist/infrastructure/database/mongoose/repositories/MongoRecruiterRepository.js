"use strict";
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
class MongoRecruiterRepository {
    create(recruiterData) {
        return __awaiter(this, void 0, void 0, function* () {
            const recruiter = new RecruiterModel_1.default(recruiterData);
            return recruiter.save();
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
            return updatedRecruiter;
        });
    }
    findRecruiters() {
        return __awaiter(this, void 0, void 0, function* () {
            const recruiters = yield RecruiterModel_1.default.find().exec();
            return recruiters;
        });
    }
}
exports.MongoRecruiterRepository = MongoRecruiterRepository;
