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
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerifyOtpUseCase = void 0;
class VerifyOtpUseCase {
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
                    throw new Error('Recruiter not found');
                }
            }
            else {
                throw new Error('Invalid OTP');
            }
        });
    }
}
exports.VerifyOtpUseCase = VerifyOtpUseCase;
