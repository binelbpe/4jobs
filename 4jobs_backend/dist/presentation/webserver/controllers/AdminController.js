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
exports.AdminController = void 0;
const LoginAdminUseCase_1 = require("../../../application/usecases/admin/LoginAdminUseCase");
const inversify_1 = require("inversify");
const types_1 = __importDefault(require("../../../types"));
let AdminController = class AdminController {
    constructor(recruiterRepository, loginAdminUseCase) {
        this.recruiterRepository = recruiterRepository;
        this.loginAdminUseCase = loginAdminUseCase;
    }
    // Login admin
    login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, password } = req.body;
                if (!email || !password) {
                    return res.status(400).json({ error: 'Email and password are required' });
                }
                const result = yield this.loginAdminUseCase.execute(email, password);
                console.log(result.token);
                res.status(200).json(result);
            }
            catch (error) {
                console.error('Error during admin login:', error);
                res.status(400).json({ error: error.message });
            }
        });
    }
    // Fetch recruiters
    fetchRecruiters(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const recruiters = yield this.recruiterRepository.findRecruiters();
                console.log("ivide und tto");
                res.status(200).json(recruiters);
            }
            catch (error) {
                console.error('Error fetching recruiters:', error);
                res.status(500).json({ error: 'Failed to fetch recruiters' });
            }
        });
    }
    // Approve recruiter
    approveRecruiter(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            try {
                const recruiter = yield this.recruiterRepository.findById(id);
                if (!recruiter) {
                    return res.status(404).json({ error: 'Recruiter not found' });
                }
                recruiter.isApproved = true;
                const updatedRecruiter = yield this.recruiterRepository.save(recruiter);
                res.status(200).json(updatedRecruiter);
            }
            catch (error) {
                console.error('Error approving recruiter:', error);
                res.status(500).json({ error: 'Failed to approve recruiter' });
            }
        });
    }
    // New method: Admin dashboard
    dashboard(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Logic for dashboard can include fetching statistics or admin-specific data
                const data = {
                    message: 'Welcome to the Admin Dashboard',
                    // Add any other data you need to display on the admin dashboard
                };
                res.status(200).json(data);
            }
            catch (error) {
                console.error('Error displaying dashboard:', error);
                res.status(500).json({ error: 'Failed to load admin dashboard' });
            }
        });
    }
};
exports.AdminController = AdminController;
exports.AdminController = AdminController = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.default.IRecruiterRepository)),
    __param(1, (0, inversify_1.inject)(types_1.default.LoginAdminUseCase)),
    __metadata("design:paramtypes", [Object, LoginAdminUseCase_1.LoginAdminUseCase])
], AdminController);
