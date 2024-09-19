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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
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
exports.RecruiterController = void 0;
const inversify_1 = require("inversify");
const types_1 = __importDefault(require("../../../types"));
const registerRecruiter_1 = require("../../../application/usecases/recruiter/registerRecruiter");
const LoginRecruiterUseCase_1 = require("../../../application/usecases/recruiter/LoginRecruiterUseCase");
const OtpService_1 = require("../../../infrastructure/services/OtpService");
// Define tempRecruiterStore globally within the file
const tempRecruiterStore = {};
let RecruiterController = class RecruiterController {
    constructor(registerUseCase, loginUseCase, otpService, recruiterRepository) {
        this.registerUseCase = registerUseCase;
        this.loginUseCase = loginUseCase;
        this.otpService = otpService;
        this.recruiterRepository = recruiterRepository;
    }
    registerRecruiter(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log("kerunnund");
                const { email, password, companyName, phone, name } = req.body;
                console.log(req.body)
                if (!email || !password || !companyName || !phone || !name) {
                    return res.status(400).json({ error: 'All fields are required' });
                }
                const existingRecruiter = yield this.recruiterRepository.findRecruiterByEmail(email);
                if (existingRecruiter) {
                    return res.status(400).json({ error: 'Recruiter already exists' });
                }
                tempRecruiterStore[email] = { email, password, companyName, phone, name };
                const otp = this.otpService.generateOtp();
                this.otpService.storeOtp(email, otp);
                yield this.otpService.sendOtp(email, otp);
                res.status(200).json({ message: 'OTP sent to email. Please verify OTP to complete registration.' });
            }
            catch (error) {
                console.error('Error during recruiter registration:', error);
                res.status(400).json({ error: error.message });
            }
        });
    }
    verifyOtp(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, otp } = req.body;
                const isValid = yield this.otpService.verifyOtp(email, otp);
                if (isValid) {
                    const recruiterData = tempRecruiterStore[email];
                    if (!recruiterData) {
                        return res.status(400).json({ error: 'Recruiter data not found. Please register again.' });
                    }
                    const result = yield this.registerUseCase.execute(recruiterData.email, recruiterData.password, recruiterData.companyName, recruiterData.phone, recruiterData.name);
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
    loginRecruiter(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, password } = req.body;
                if (!email || !password) {
                    return res.status(400).json({ error: 'Email and password are required' });
                }
                const result = yield this.loginUseCase.execute(email, password);
               
                res.status(200).json(result);
            }
            catch (error) {
                console.error('Error during recruiter login:', error);
                res.status(400).json({ error: error.message });
            }
        });
    }
    sendOtp(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email } = req.body;
                if (!email) {
                    return res.status(400).json({ error: 'Email is required' });
                }
                const otp = this.otpService.generateOtp();
                this.otpService.storeOtp(email, otp);
                yield this.otpService.sendOtp(email, otp);
                res.status(200).json({ message: 'OTP sent to email.' });
            }
            catch (error) {
                console.error('Error sending OTP:', error);
                res.status(500).json({ error: 'Failed to send OTP' });
            }
        });
    }
};
exports.RecruiterController = RecruiterController;
exports.RecruiterController = RecruiterController = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.default.RegisterRecruiterUseCase)),
    __param(1, (0, inversify_1.inject)(types_1.default.LoginRecruiterUseCase)),
    __param(2, (0, inversify_1.inject)(types_1.default.OtpService)),
    __param(3, (0, inversify_1.inject)(types_1.default.IRecruiterRepository)),
    __metadata("design:paramtypes", [registerRecruiter_1.RegisterRecruiterUseCase,
        LoginRecruiterUseCase_1.LoginRecruiterUseCase,
        OtpService_1.OtpService, Object])
], RecruiterController);
