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
exports.SignupRecruiterUseCase = void 0;
class SignupRecruiterUseCase {
    constructor(recruiterRepository, authService) {
        this.recruiterRepository = recruiterRepository;
        this.authService = authService;
    }
    execute(email, password, name, company, position) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingRecruiter = yield this.recruiterRepository.findByEmail(email);
            if (existingRecruiter) {
                throw new Error('Recruiter already exists');
            }
            const hashedPassword = yield this.authService.hashPassword(password);
            const recruiter = yield this.recruiterRepository.create({
                email,
                password: hashedPassword,
                name,
                role: 'recruiter',
                company,
                position,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            const token = this.authService.generateToken(recruiter);
            return { recruiter, token };
        });
    }
}
exports.SignupRecruiterUseCase = SignupRecruiterUseCase;
