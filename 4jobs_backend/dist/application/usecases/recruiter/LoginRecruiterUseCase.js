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
exports.LoginRecruiterUseCase = void 0;
const JwtAuthService_1 = require("../../../infrastructure/services/JwtAuthService");
const inversify_1 = require("inversify");
const types_1 = __importDefault(require("../../../types"));
let LoginRecruiterUseCase = class LoginRecruiterUseCase {
    constructor(recruiterRepository, authService) {
        this.recruiterRepository = recruiterRepository;
        this.authService = authService;
    }
    execute(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const recruiter = yield this.recruiterRepository.findRecruiterByEmail(email);
            if (!recruiter) {
                throw new Error("Invalid credentials");
            }
            const isPasswordValid = yield this.authService.comparePasswords(password, recruiter.password);
            if (!isPasswordValid) {
                throw new Error("Invalid credentials");
            }
            const token = this.authService.generateToken({
                id: recruiter.id,
                email: recruiter.email,
                role: "recruiter",
                password: recruiter.password, // Include password in the token payload
                name: recruiter.name, // Include name in the token payload
            });
            return {
                token,
                recruiter: {
                    id: recruiter.id,
                    email: recruiter.email,
                    companyName: recruiter.companyName,
                    phone: recruiter.phone,
                    name: recruiter.name,
                    role: recruiter.role,
                    isApproved: recruiter.isApproved,
                    createdAt: recruiter.createdAt,
                    updatedAt: recruiter.updatedAt,
                    governmentId: recruiter.governmentId,
                    employeeId: recruiter.employeeId,
                    location: recruiter.location,
                    employeeIdImage: recruiter.employeeIdImage,
                    subscribed: recruiter.subscribed,
                    planDuration: recruiter.planDuration,
                    expiryDate: recruiter.expiryDate,
                    subscriptionAmount: recruiter.subscriptionAmount,
                    subscriptionStartDate: recruiter.subscriptionStartDate,
                },
            };
        });
    }
};
exports.LoginRecruiterUseCase = LoginRecruiterUseCase;
exports.LoginRecruiterUseCase = LoginRecruiterUseCase = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.default.IRecruiterRepository)),
    __param(1, (0, inversify_1.inject)(types_1.default.JwtAuthService)),
    __metadata("design:paramtypes", [Object, JwtAuthService_1.JwtAuthService])
], LoginRecruiterUseCase);
