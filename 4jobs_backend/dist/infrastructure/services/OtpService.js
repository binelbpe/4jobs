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
                console.log(`Sending OTP ${otp} to email ${email}`);
                yield this.emailService.sendWelcomeEmail(email, `Your OTP: ${otp}`);
                console.log(`Sending OTP ${otp} to email ${email}`);
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
}
exports.OtpService = OtpService;
