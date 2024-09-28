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
exports.SignupUserUseCase = void 0;
// src/application/usecases/auth/SignupUserUseCase.ts
const inversify_1 = require("inversify");
const types_1 = __importDefault(require("../../../types"));
let SignupUserUseCase = class SignupUserUseCase {
    constructor(userRepository, authService) {
        this.userRepository = userRepository;
        this.authService = authService;
    }
    execute(email_1, password_1, name_1) {
        return __awaiter(this, arguments, void 0, function* (email, password, name, isGoogleAuth = false) {
            if (!isGoogleAuth) {
                const existingUser = yield this.userRepository.findByEmail(email);
                if (existingUser) {
                    throw new Error("User already exists");
                }
                // Ensure password is hashed before saving the user
                const hashedPassword = yield this.authService.hashPassword(password);
                const user = yield this.userRepository.create({
                    email,
                    password: hashedPassword, // Save hashed password
                    name,
                    role: "user",
                    isAdmin: false,
                    experiences: [],
                    projects: [],
                    certificates: [],
                    skills: [],
                });
                const token = this.authService.generateToken(user);
                return { user, token };
            }
            else {
                let user = yield this.userRepository.findByEmail(email);
                if (user) {
                    return { user, token: this.authService.generateToken(user) };
                }
                user = yield this.userRepository.create({
                    email,
                    password: "", // No password required for Google Auth
                    name,
                    role: "user",
                    isAdmin: false,
                    experiences: [],
                    projects: [],
                    certificates: [],
                    skills: [],
                });
                const token = this.authService.generateToken(user);
                console.log("g user", user);
                return { user, token };
            }
        });
    }
};
exports.SignupUserUseCase = SignupUserUseCase;
exports.SignupUserUseCase = SignupUserUseCase = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.default.IUserRepository)),
    __param(1, (0, inversify_1.inject)(types_1.default.IAuthService)),
    __metadata("design:paramtypes", [Object, Object])
], SignupUserUseCase);
