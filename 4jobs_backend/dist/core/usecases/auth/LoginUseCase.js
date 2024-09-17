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
exports.LoginUseCase = void 0;
class LoginUseCase {
    constructor(userRepository, authService) {
        this.userRepository = userRepository;
        this.authService = authService;
    }
    execute(email_1, password_1) {
        return __awaiter(this, arguments, void 0, function* (email, password, isGoogleAuth = false) {
            if (!isGoogleAuth) {
                // Regular login
                const user = yield this.userRepository.findByEmail(email);
                if (!user) {
                    throw new Error('User not found');
                }
                const isPasswordValid = yield this.authService.comparePasswords(password, user.password);
                if (!isPasswordValid) {
                    throw new Error('Invalid password');
                }
                const token = this.authService.generateToken(user);
                return { user, token };
            }
            else {
                // Google login
                const user = yield this.userRepository.findByEmail(email);
                if (!user) {
                    throw new Error('User not found');
                }
                const token = this.authService.generateToken(user);
                return { user, token };
            }
        });
    }
}
exports.LoginUseCase = LoginUseCase;
