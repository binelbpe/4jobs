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
const types_1 = __importDefault(require("../../types"));
const registerRecruiter_1 = require("../../application/usecases/recruiter/registerRecruiter");
const LoginRecruiterUseCase_1 = require("../../application/usecases/recruiter/LoginRecruiterUseCase");
const OtpService_1 = require("../../infrastructure/services/OtpService");
const tempRecruiterStore = {};
let RecruiterController = class RecruiterController {
    constructor(registerUseCase, loginUseCase, otpService, recruiterRepository) {
        this.registerUseCase = registerUseCase;
        this.loginUseCase = loginUseCase;
        this.otpService = otpService;
        this.recruiterRepository = recruiterRepository;
    }
    // Register Recruiter
    registerRecruiter(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const { email, password, companyName, phone, name } = req.body;
                const governmentId = ((_a = req.files) === null || _a === void 0 ? void 0 : _a['governmentId']) ? req.files['governmentId'][0].path : undefined;
                const employeeIdImage = ((_b = req.files) === null || _b === void 0 ? void 0 : _b['employeeIdImage']) ? req.files['employeeIdImage'][0].path : undefined;
                if (!email || !password || !companyName || !phone || !name || !governmentId) {
                    return res.status(400).json({ error: 'All fields are required, including government ID' });
                }
                const existingRecruiter = yield this.recruiterRepository.findRecruiterByEmail(email);
                if (existingRecruiter) {
                    return res.status(400).json({ error: 'Recruiter already exists' });
                }
                tempRecruiterStore[email] = { email, password, companyName, phone, name, governmentId };
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
    // Verify OTP
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
                    const result = yield this.registerUseCase.execute(recruiterData.email, recruiterData.password, recruiterData.companyName, recruiterData.phone, recruiterData.name, recruiterData.governmentId || '');
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
    // Login Recruiter
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
    // Send OTP
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
    // Get Recruiter Profile
    getProfile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const recruiter = yield this.recruiterRepository.findRecruiterById(id);
                if (!recruiter) {
                    return res.status(404).json({ error: 'Recruiter not found' });
                }
                res.status(200).json(recruiter);
            }
            catch (error) {
                console.error('Error fetching recruiter profile:', error);
                res.status(500).json({ error: 'Failed to fetch profile' });
            }
        });
    }
    // Update Recruiter Profile
    updateProfile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const { id } = req.params;
                const updates = req.body;
                const governmentIdImage = ((_a = req.files) === null || _a === void 0 ? void 0 : _a['governmentId']) ? req.files['governmentId'][0].path : undefined;
                const employeeIdImage = ((_b = req.files) === null || _b === void 0 ? void 0 : _b['employeeIdImage']) ? req.files['employeeIdImage'][0].path : undefined;
                if (governmentIdImage) {
                    updates.governmentId = governmentIdImage;
                }
                if (employeeIdImage) {
                    updates.employeeIdImage = employeeIdImage;
                }
                const updatedRecruiter = yield this.recruiterRepository.updateRecruiter(id, updates);
                console.log("updaterec", updatedRecruiter);
                if (!updatedRecruiter) {
                    return res.status(404).json({ error: 'Recruiter not found' });
                }
                res.status(200).json(updatedRecruiter);
            }
            catch (error) {
                console.error('Error updating recruiter profile:', error);
                res.status(500).json({ error: 'Failed to update profile' });
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
