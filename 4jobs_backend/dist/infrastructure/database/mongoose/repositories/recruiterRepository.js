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
const RecruiterModel_1 = __importDefault(require("../../../database/mongoose/models/RecruiterModel"));
class RecruiterRepository {
    registerRecruiter(recruiter) {
        return __awaiter(this, void 0, void 0, function* () {
            return new RecruiterModel_1.default(recruiter).save();
        });
    }
    findRecruiterById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return RecruiterModel_1.default.findById(id);
        });
    }
    findRecruiterByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            return RecruiterModel_1.default.findOne({ email });
        });
    }
    verifyOtp(email, otp) {
        return __awaiter(this, void 0, void 0, function* () {
            return RecruiterModel_1.default.findOneAndUpdate({ email, otp }, { isVerified: true, otp: null }, { new: true });
        });
    }
    approveRecruiter(id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield RecruiterModel_1.default.findByIdAndUpdate(id, { isApproved: true });
        });
    }
}
exports.default = RecruiterRepository;
