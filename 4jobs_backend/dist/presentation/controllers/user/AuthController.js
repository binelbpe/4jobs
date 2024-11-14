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
exports.AuthController = void 0;
const inversify_1 = require("inversify");
const types_1 = __importDefault(require("../../../types"));
const SignupUserUseCase_1 = require("../../../application/usecases/user/SignupUserUseCase");
const LoginUseCase_1 = require("../../../application/usecases/user/LoginUseCase");
const JwtAuthService_1 = require("../../../infrastructure/services/JwtAuthService");
const OtpService_1 = require("../../../infrastructure/services/OtpService");
const GoogleAuthService_1 = require("../../../infrastructure/services/GoogleAuthService");
const SearchUsersAndJobsUseCase_1 = require("../../../application/usecases/user/SearchUsersAndJobsUseCase");
const tempUserStore = {};
let AuthController = class AuthController {
    constructor(signupUseCase, loginUseCase, otpService, userRepository, googleAuthService, jwtAuthService, searchUsersAndJobsUseCase) {
        this.signupUseCase = signupUseCase;
        this.loginUseCase = loginUseCase;
        this.otpService = otpService;
        this.userRepository = userRepository;
        this.googleAuthService = googleAuthService;
        this.jwtAuthService = jwtAuthService;
        this.searchUsersAndJobsUseCase = searchUsersAndJobsUseCase;
    }
    sendOtp(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email } = req.body;
                if (!email) {
                    return res.status(400).json({ error: "Email is required" });
                }
                const otp = this.otpService.generateOtp();
                this.otpService.storeOtp(email, otp);
                yield this.otpService.sendOtp(email, otp);
                res.status(200).json({ message: "OTP sent to email." });
            }
            catch (error) {
                console.error("Error sending OTP:", error);
                res.status(500).json({ error: "Failed to send OTP" });
            }
        });
    }
    signupUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, password, name } = req.body;
                if (!email || !password || !name) {
                    return res
                        .status(400)
                        .json({ error: "Email, password, and name are required" });
                }
                const existingUser = yield this.userRepository.findByEmail(email);
                if (existingUser) {
                    return res.status(400).json({ error: "User already exists" });
                }
                tempUserStore[email] = { email, password, name };
                const otp = this.otpService.generateOtp();
                this.otpService.storeOtp(email, otp);
                yield this.otpService.sendOtp(email, otp);
                res.status(200).json({
                    message: "OTP sent to email. Please verify OTP to complete signup.",
                });
            }
            catch (error) {
                console.error("Error during user signup:", error);
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
                    const userData = tempUserStore[email];
                    if (!userData) {
                        return res
                            .status(400)
                            .json({ error: "User data not found. Please sign up again." });
                    }
                    const result = yield this.signupUseCase.execute(userData.email, userData.password, userData.name);
                    delete tempUserStore[email];
                    res.status(201).json(result);
                }
                else {
                    res.status(400).json({ error: "Invalid OTP" });
                }
            }
            catch (error) {
                console.error("Error verifying OTP:", error);
                res.status(500).json({ error: "Failed to verify OTP" });
            }
        });
    }
    login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, password } = req.body;
                if (!email || !password) {
                    return res
                        .status(400)
                        .json({ error: "Email and password are required" });
                }
                const result = yield this.loginUseCase.execute(email, password);
                res.status(200).json(result);
            }
            catch (error) {
                console.error("Error during login:", error);
                res.status(400).json({ error: error.message });
            }
        });
    }
    googleAuth(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const tokenId = req.body.googleToken;
                if (!tokenId) {
                    return res.status(400).json({ error: "ID Token is required" });
                }
                const payload = yield this.googleAuthService.verifyToken(tokenId);
                const email = payload === null || payload === void 0 ? void 0 : payload.email;
                const name = (payload === null || payload === void 0 ? void 0 : payload.name) || "Google User";
                if (!email) {
                    return res.status(400).json({
                        error: "Google authentication failed. No email found in token.",
                    });
                }
                let user = yield this.userRepository.findByEmail(email);
                if (user) {
                    const result = yield this.loginUseCase.execute(email, "", true);
                    const token = this.jwtAuthService.generateToken(user);
                    return res.status(200).json(result);
                }
                else {
                    user = yield this.userRepository.create({
                        email,
                        password: "",
                        name,
                        role: "user",
                        isAdmin: false,
                        experiences: [],
                        projects: [],
                        certificates: [],
                        skills: [],
                        appliedJobs: [],
                    });
                    const token = this.jwtAuthService.generateToken(user);
                    return res.status(201).json({ user, token });
                }
            }
            catch (error) {
                console.error("Error during Google authentication:", error);
                return res
                    .status(500)
                    .json({ error: "Failed to authenticate with Google" });
            }
        });
    }
    searchUsersAndJobs(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { query } = req.query;
                const { userId } = req.query;
                if (typeof query !== "string" || query.length < 3 || !userId) {
                    return res
                        .status(400)
                        .json({ error: "Invalid query or user not authenticated" });
                }
                const results = yield this.searchUsersAndJobsUseCase.execute(query, userId);
                res.status(200).json(results);
            }
            catch (error) {
                console.error("Error searching users and jobs:", error);
                res.status(500).json({ error: "An error occurred while searching" });
            }
        });
    }
    sendForgotPasswordOtp(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email } = req.body;
                const otp = this.otpService.generateOtp();
                yield this.otpService.sendForgotPasswordOtp(email, otp);
                res.status(200).json({ message: 'OTP sent for password reset' });
            }
            catch (error) {
                console.error('Error sending forgot password OTP:', error);
                res.status(500).json({ error: 'Failed to send OTP' });
            }
        });
    }
    verifyForgotPasswordOtp(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, otp } = req.body;
                const isValid = yield this.otpService.verifyOtp(email, otp);
                if (isValid) {
                    res.status(200).json({ message: 'OTP verified successfully' });
                }
                else {
                    res.status(400).json({ error: 'Invalid OTP' });
                }
            }
            catch (error) {
                console.error('Error verifying forgot password OTP:', error);
                res.status(500).json({ error: 'Failed to verify OTP' });
            }
        });
    }
    resetPassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, newPassword, otp } = req.body;
                const isValidOtp = yield this.otpService.verifyOtp(email, otp);
                if (!isValidOtp) {
                    return res.status(400).json({ error: 'Invalid OTP' });
                }
                const user = yield this.userRepository.findByEmail(email);
                if (!user) {
                    return res.status(404).json({ error: 'User not found' });
                }
                const hashedPassword = yield this.jwtAuthService.hashPassword(newPassword);
                yield this.userRepository.updatePassword(user.id, hashedPassword);
                res.status(200).json({ message: 'Password reset successfully' });
            }
            catch (error) {
                console.error('Error resetting password:', error);
                res.status(500).json({ error: 'Failed to reset password' });
            }
        });
    }
};
exports.AuthController = AuthController;
exports.AuthController = AuthController = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.default.SignupUserUseCase)),
    __param(1, (0, inversify_1.inject)(types_1.default.LoginUseCase)),
    __param(2, (0, inversify_1.inject)(types_1.default.OtpService)),
    __param(3, (0, inversify_1.inject)(types_1.default.IUserRepository)),
    __param(4, (0, inversify_1.inject)(types_1.default.GoogleAuthService)),
    __param(5, (0, inversify_1.inject)(types_1.default.JwtAuthService)),
    __param(6, (0, inversify_1.inject)(types_1.default.SearchUsersAndJobsUseCase)),
    __metadata("design:paramtypes", [SignupUserUseCase_1.SignupUserUseCase,
        LoginUseCase_1.LoginUseCase,
        OtpService_1.OtpService, Object, GoogleAuthService_1.GoogleAuthService,
        JwtAuthService_1.JwtAuthService,
        SearchUsersAndJobsUseCase_1.SearchUsersAndJobsUseCase])
], AuthController);
