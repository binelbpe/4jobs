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
exports.OtpService = void 0;
const crypto_1 = __importDefault(require("crypto"));
const otpStore = {};
class OtpService {
    constructor(otpExpiry, emailService) {
        this.otpExpiry = otpExpiry;
        this.emailService = emailService;
    }
    generateOtp() {
        return crypto_1.default.randomInt(100000, 999999).toString();
    }
    sendOtp(email, otp) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const subject = 'Your OTP for 4JOBS';
                const text = `Your OTP is: ${otp}`;
                const html = `<p>Your OTP is: <strong>${otp}</strong></p>`;
                yield this.emailService.sendEmail(email, subject, text, html);
                console.log(`Sent OTP ${otp} to email ${email}`);
            }
            catch (error) {
                console.error('Error sending OTP email:', error);
                throw new Error('Failed to send OTP via email');
            }
        });
    }
    storeOtp(email, otp) {
        otpStore[email] = otp;
        setTimeout(() => delete otpStore[email], this.otpExpiry);
    }
    verifyOtp(email, otp) {
        return __awaiter(this, void 0, void 0, function* () {
            const storedOtp = otpStore[email];
            return storedOtp === otp;
        });
    }
    sendForgotPasswordOtp(email, otp) {
        return __awaiter(this, void 0, void 0, function* () {
            const subject = "Password Reset OTP";
            const text = `Your OTP for password reset is: ${otp}. This OTP is valid for 5 minutes.`;
            const html = `<p>Your OTP for password reset is: <strong>${otp}</strong>. This OTP is valid for 5 minutes.</p>`;
            console.log(`otp: ${otp} email ${email}`);
            yield this.emailService.sendEmail(email, subject, text, html);
        });
    }
}
exports.OtpService = OtpService;
