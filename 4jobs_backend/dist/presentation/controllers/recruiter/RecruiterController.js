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
const RegisterRecruiterUsecase_1 = require("../../../application/usecases/recruiter/RegisterRecruiterUsecase");
const LoginRecruiterUseCase_1 = require("../../../application/usecases/recruiter/LoginRecruiterUseCase");
const UpdateRecruiterUseCase_1 = require("../../../application/usecases/recruiter/UpdateRecruiterUseCase");
const GetRecruiterProfileUseCase_1 = require("../../../application/usecases/recruiter/GetRecruiterProfileUseCase");
const OtpService_1 = require("../../../infrastructure/services/OtpService");
const S3Service_1 = require("../../../infrastructure/services/S3Service");
const SearchUsersUseCase_1 = require("../../../application/usecases/recruiter/SearchUsersUseCase");
const JwtAuthService_1 = require("../../../infrastructure/services/JwtAuthService");
const tempRecruiterStore = {};
let RecruiterController = class RecruiterController {
    constructor(registerUseCase, loginUseCase, updateRecruiterUseCase, getRecruiterProfileUseCase, otpService, recruiterRepository, s3Service, searchUsersUseCase, jwtAuthService) {
        this.registerUseCase = registerUseCase;
        this.loginUseCase = loginUseCase;
        this.updateRecruiterUseCase = updateRecruiterUseCase;
        this.getRecruiterProfileUseCase = getRecruiterProfileUseCase;
        this.otpService = otpService;
        this.recruiterRepository = recruiterRepository;
        this.s3Service = s3Service;
        this.searchUsersUseCase = searchUsersUseCase;
        this.jwtAuthService = jwtAuthService;
    }
    registerRecruiter(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, password, companyName, phone, name } = req.body;
                const governmentIdFile = req.file;
                if (!email ||
                    !password ||
                    !companyName ||
                    !phone ||
                    !name ||
                    !governmentIdFile) {
                    return res
                        .status(400)
                        .json({ error: "All fields are required, including government ID" });
                }
                const existingRecruiter = yield this.recruiterRepository.findRecruiterByEmail(email);
                if (existingRecruiter) {
                    return res.status(400).json({ error: "Recruiter already exists" });
                }
                const governmentIdUrl = yield this.s3Service.uploadFile(governmentIdFile);
                tempRecruiterStore[email] = {
                    email,
                    password,
                    companyName,
                    phone,
                    name,
                    governmentId: governmentIdUrl,
                };
                const otp = this.otpService.generateOtp();
                this.otpService.storeOtp(email, otp);
                yield this.otpService.sendOtp(email, otp);
                res.status(200).json({
                    message: "OTP sent to email. Please verify OTP to complete registration.",
                });
            }
            catch (error) {
                console.error("Error during recruiter registration:", error);
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
                        return res.status(400).json({
                            error: "Recruiter data not found. Please register again.",
                        });
                    }
                    const result = yield this.registerUseCase.execute(recruiterData.email, recruiterData.password, recruiterData.companyName, recruiterData.phone, recruiterData.name, recruiterData.governmentId || "");
                    delete tempRecruiterStore[email];
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
    loginRecruiter(req, res) {
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
                console.error("Error during recruiter login:", error);
                res.status(400).json({ error: error.message });
            }
        });
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
    getProfile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const recruiter = yield this.getRecruiterProfileUseCase.execute(id);
                if (!recruiter) {
                    return res.status(404).json({ error: "Recruiter not found" });
                }
                res.status(200).json(recruiter);
            }
            catch (error) {
                console.error("Error fetching recruiter profile:", error);
                res.status(500).json({ error: "Failed to fetch profile" });
            }
        });
    }
    updateProfile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            try {
                const { id } = req.params;
                const updates = req.body;
                const governmentIdFile = (_b = (_a = req.files) === null || _a === void 0 ? void 0 : _a["governmentId"]) === null || _b === void 0 ? void 0 : _b[0];
                const employeeIdFile = (_d = (_c = req.files) === null || _c === void 0 ? void 0 : _c["employeeIdImage"]) === null || _d === void 0 ? void 0 : _d[0];
                if (governmentIdFile) {
                    const governmentIdUrl = yield this.s3Service.uploadFile(governmentIdFile);
                    updates.governmentId = governmentIdUrl;
                }
                if (employeeIdFile) {
                    const employeeIdUrl = yield this.s3Service.uploadFile(employeeIdFile);
                    updates.employeeIdImage = employeeIdUrl;
                }
                const updatedRecruiter = yield this.updateRecruiterUseCase.execute(id, updates);
                if (!updatedRecruiter) {
                    return res.status(404).json({ error: "Recruiter not found" });
                }
                res.status(200).json(updatedRecruiter);
            }
            catch (error) {
                console.error("Error updating recruiter profile:", error);
                res.status(500).json({ error: "Failed to update profile" });
            }
        });
    }
    searchUsers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { query } = req.query;
                if (typeof query !== "string") {
                    return res.status(400).json({ error: "Invalid query parameter" });
                }
                const users = yield this.searchUsersUseCase.execute(query);
                res.status(200).json(users);
            }
            catch (error) {
                console.error("Error searching users:", error);
                res.status(500).json({ error: "Failed to search users" });
            }
        });
    }
    refreshRecruiterToken(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { refreshToken } = req.body;
                const decoded = this.jwtAuthService.verifyToken(refreshToken);
                const recruiter = yield this.recruiterRepository.findById(decoded.id);
                if (!recruiter) {
                    return res.status(404).json({ error: 'Recruiter not found' });
                }
                const newToken = this.jwtAuthService.generateToken(recruiter);
                res.json({ token: newToken, recruiter });
            }
            catch (error) {
                console.error('Error refreshing recruiter token:', error);
                res.status(401).json({ error: 'Invalid refresh token' });
            }
        });
    }
};
exports.RecruiterController = RecruiterController;
exports.RecruiterController = RecruiterController = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.default.RegisterRecruiterUseCase)),
    __param(1, (0, inversify_1.inject)(types_1.default.LoginRecruiterUseCase)),
    __param(2, (0, inversify_1.inject)(types_1.default.UpdateRecruiterUseCase)),
    __param(3, (0, inversify_1.inject)(types_1.default.GetRecruiterProfileUseCase)),
    __param(4, (0, inversify_1.inject)(types_1.default.OtpService)),
    __param(5, (0, inversify_1.inject)(types_1.default.IRecruiterRepository)),
    __param(6, (0, inversify_1.inject)(types_1.default.S3Service)),
    __param(7, (0, inversify_1.inject)(types_1.default.SearchUsersUseCase)),
    __param(8, (0, inversify_1.inject)(types_1.default.JwtAuthService)),
    __metadata("design:paramtypes", [RegisterRecruiterUsecase_1.RegisterRecruiterUseCase,
        LoginRecruiterUseCase_1.LoginRecruiterUseCase,
        UpdateRecruiterUseCase_1.UpdateRecruiterUseCase,
        GetRecruiterProfileUseCase_1.GetRecruiterProfileUseCase,
        OtpService_1.OtpService, Object, S3Service_1.S3Service,
        SearchUsersUseCase_1.SearchUsersUseCase,
        JwtAuthService_1.JwtAuthService])
], RecruiterController);
