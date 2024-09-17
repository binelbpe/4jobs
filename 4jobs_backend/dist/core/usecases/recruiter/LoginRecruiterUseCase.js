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
exports.LoginRecruiterUseCase = void 0;
class LoginRecruiterUseCase {
    constructor(recruiterRepository, authService) {
        this.recruiterRepository = recruiterRepository;
        this.authService = authService;
    }
    execute(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const recruiter = yield this.recruiterRepository.findRecruiterByEmail(email);
            if (!recruiter || recruiter.password !== password) {
                throw new Error('Invalid credentials');
            }
            const token = this.authService.generateToken({
                id: recruiter.id,
                email: recruiter.email,
                password: recruiter.password,
                role: 'recruiter',
                name: recruiter.name,
                createdAt: recruiter.createdAt,
                updatedAt: recruiter.updatedAt,
                isAdmin: false
            });
            return {
                isApproved: recruiter.isApproved,
                token,
                recruiter: {
                    id: recruiter.id,
                    email: recruiter.email,
                    name: recruiter.name,
                    companyName: recruiter.companyName,
                    phone: recruiter.phone,
                    createdAt: recruiter.createdAt,
                    updatedAt: recruiter.updatedAt,
                    isApproved: recruiter.isApproved,
                },
            };
        });
    }
}
exports.LoginRecruiterUseCase = LoginRecruiterUseCase;
