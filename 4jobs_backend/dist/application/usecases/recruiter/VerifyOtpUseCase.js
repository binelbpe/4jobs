"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
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
exports.VerifyOtpUseCase = void 0;
const OtpService_1 = require("../../../infrastructure/services/OtpService");
const inversify_1 = require("inversify");
let VerifyOtpUseCase = class VerifyOtpUseCase {
    constructor(recruiterRepository, otpService) {
        this.recruiterRepository = recruiterRepository;
        this.otpService = otpService;
    }
    execute(email, otp) {
        return __awaiter(this, void 0, void 0, function* () {
            const isValid = yield this.otpService.verifyOtp(email, otp);
            if (isValid) {
                const recruiter = yield this.recruiterRepository.findByEmail(email);
                if (recruiter) {
                    recruiter.isApproved = true;
                    yield this.recruiterRepository.save(recruiter);
                    return recruiter;
                }
                else {
                    throw new Error("Recruiter not found");
                }
            }
            else {
                throw new Error("Invalid OTP");
            }
        });
    }
};
exports.VerifyOtpUseCase = VerifyOtpUseCase;
exports.VerifyOtpUseCase = VerifyOtpUseCase = __decorate([
    (0, inversify_1.injectable)(),
    __metadata("design:paramtypes", [Object, OtpService_1.OtpService])
], VerifyOtpUseCase);
