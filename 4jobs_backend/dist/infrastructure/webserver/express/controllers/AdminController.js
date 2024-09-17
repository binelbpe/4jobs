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
exports.AdminController = void 0;
const LoginAdminUseCase_1 = require("../../../../core/usecases/auth/LoginAdminUseCase");
const MongoUserRepository_1 = require("../../../database/mongoose/repositories/MongoUserRepository");
const JwtAuthService_1 = require("../../../services/JwtAuthService");
const MongoRecruiterRepository_1 = require("../../../database/mongoose/repositories/MongoRecruiterRepository");
const userRepository = new MongoUserRepository_1.MongoUserRepository();
const authService = new JwtAuthService_1.JwtAuthService(process.env.JWT_SECRET || 'secret_1');
const recruiterRepository = new MongoRecruiterRepository_1.MongoRecruiterRepository();
class AdminController {
    static login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, password } = req.body;
                console.log("req.body", req.body);
                if (!email || !password) {
                    return res.status(400).json({ error: 'Email and password are required' });
                }
                const loginUseCase = new LoginAdminUseCase_1.LoginAdminUseCase(userRepository, authService);
                const result = yield loginUseCase.execute(email, password);
                res.status(200).json(result);
            }
            catch (error) {
                console.error('Error during admin login:', error);
                res.status(400).json({ error: error.message });
            }
        });
    }
    static dashboard(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                res.status(200).json({ message: 'Welcome to the admin dashboard!' });
            }
            catch (error) {
                console.error('Error during admin dashboard access:', error);
                res.status(500).json({ error: 'Failed to access admin dashboard' });
            }
        });
    }
    static fetchRecruiters(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const recruiters = yield recruiterRepository.findRecruiters();
                res.status(200).json(recruiters);
            }
            catch (error) {
                console.error('Error fetching recruiters:', error);
                res.status(500).json({ error: 'Failed to fetch recruiters' });
            }
        });
    }
    static approveRecruiter(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            try {
                const recruiter = yield recruiterRepository.findById(id);
                if (!recruiter) {
                    return res.status(404).json({ error: 'Recruiter not found' });
                }
                console.log("akathu keriittund");
                recruiter.isApproved = true;
                const updatedRecruiter = yield recruiterRepository.save(recruiter);
                res.status(200).json(updatedRecruiter);
            }
            catch (error) {
                console.error('Error approving recruiter:', error);
                res.status(500).json({ error: 'Failed to approve recruiter' });
            }
        });
    }
}
exports.AdminController = AdminController;
