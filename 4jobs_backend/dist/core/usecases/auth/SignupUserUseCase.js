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
exports.SignupUserUseCase = void 0;
class SignupUserUseCase {
    constructor(userRepository, authService) {
        this.userRepository = userRepository;
        this.authService = authService;
    }
    execute(email_1, password_1, name_1) {
        return __awaiter(this, arguments, void 0, function* (email, password, name, isGoogleAuth = false) {
            if (!isGoogleAuth) {
                const existingUser = yield this.userRepository.findByEmail(email);
                if (existingUser) {
                    throw new Error('User already exists');
                }
                const hashedPassword = yield this.authService.hashPassword(password);
                const user = yield this.userRepository.create({
                    email,
                    password: hashedPassword,
                    name,
                    role: 'user',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    isAdmin: false,
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
                    password: "",
                    name,
                    role: 'user',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    isAdmin: false,
                });
                const token = this.authService.generateToken(user);
                return { user, token };
            }
        });
    }
}
exports.SignupUserUseCase = SignupUserUseCase;
