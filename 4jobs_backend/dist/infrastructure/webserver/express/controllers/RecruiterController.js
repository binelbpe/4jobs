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
exports.RecruiterController = void 0;
const registerRecruiter_1 = require("../../../../core/usecases/recruiter/registerRecruiter");
const LoginRecruiterUseCase_1 = require("../../../../core/usecases/recruiter/LoginRecruiterUseCase");
const MongoRecruiterRepository_1 = require("../../../database/mongoose/repositories/MongoRecruiterRepository");
const JwtAuthService_1 = require("../../../services/JwtAuthService");
const OtpService_1 = require("../../../services/OtpService");
const NodemailerEmailService_1 = require("../../../services/NodemailerEmailService");
const jwtSecret = process.env.JWT_SECRET || 'secret_1';
const recruiterRepository = new MongoRecruiterRepository_1.MongoRecruiterRepository();
const authService = new JwtAuthService_1.JwtAuthService(jwtSecret);
const emailService = new NodemailerEmailService_1.NodemailerEmailService();
const otpService = new OtpService_1.OtpService(33 * 1000, emailService);
const tempRecruiterStore = {};
class RecruiterController {
    static registerRecruiter(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, password, companyName, phone, name } = req.body;
                if (!email || !password || !companyName || !phone || !name) {
                    return res.status(400).json({ error: 'All fields are required' });
                }
                const existingRecruiter = yield recruiterRepository.findRecruiterByEmail(email);
                if (existingRecruiter) {
                    return res.status(400).json({ error: 'Recruiter already exists' });
                }
                tempRecruiterStore[email] = {
                    email,
                    password,
                    companyName,
                    phone,
                    name,
                };
                const otp = otpService.generateOtp();
                otpService.storeOtp(email, otp);
                yield otpService.sendOtp(email, otp);
                res.status(200).json({ message: 'OTP sent to email. Please verify OTP to complete registration.' });
            }
            catch (error) {
                console.error('Error during recruiter registration:', error);
                res.status(400).json({ error: error.message });
            }
        });
    }
    static verifyOtp(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, otp } = req.body;
                const isValid = yield otpService.verifyOtp(email, otp);
                if (isValid) {
                    const recruiterData = tempRecruiterStore[email];
                    if (!recruiterData) {
                        return res.status(400).json({ error: 'Recruiter data not found. Please register again.' });
                    }
                    const registerUseCase = new registerRecruiter_1.RegisterRecruiterUseCase(recruiterRepository, authService);
                    const result = yield registerUseCase.execute(recruiterData.email, recruiterData.password, recruiterData.companyName, recruiterData.phone, recruiterData.name);
                    delete tempRecruiterStore[email];
                    res.status(201).json(result);
                }
                else {
                    res.status(400).json({ error: 'Invalid OTP' });
                }
            }
            catch (error) {
                console.error('Error verifying OTP:', error);
                res.status(500).json({ error: 'Failed to verify OTP' });
            }
        });
    }
    static loginRecruiter(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, password } = req.body;
                if (!email || !password) {
                    return res.status(400).json({ error: 'Email and password are required' });
                }
                const loginUseCase = new LoginRecruiterUseCase_1.LoginRecruiterUseCase(recruiterRepository, authService);
                const result = yield loginUseCase.execute(email, password);
                res.status(200).json(result);
            }
            catch (error) {
                console.error('Error during recruiter login:', error);
                res.status(400).json({ error: error.message });
            }
        });
    }
    static sendOtp(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email } = req.body;
                console.log(req.body);
                if (!email) {
                    return res.status(400).json({ error: 'Email is required' });
                }
                const otp = otpService.generateOtp();
                otpService.storeOtp(email, otp);
                yield otpService.sendOtp(email, otp);
                res.status(200).json({ message: 'OTP sent to email.' });
            }
            catch (error) {
                console.error('Error sending OTP:', error);
                res.status(500).json({ error: 'Failed to send OTP' });
            }
        });
    }
}
exports.RecruiterController = RecruiterController;
