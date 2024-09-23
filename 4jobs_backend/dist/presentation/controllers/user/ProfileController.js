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
exports.ProfileController = void 0;
const inversify_1 = require("inversify");
const types_1 = __importDefault(require("../../../types"));
const GetUserProfileUseCase_1 = require("../../../application/usecases/auth/GetUserProfileUseCase");
const UpdateUserProfileUseCase_1 = require("../../../application/usecases/auth/UpdateUserProfileUseCase");
let ProfileController = class ProfileController {
    constructor(getUserProfileUseCase, updateUserProfileUseCase) {
        this.getUserProfileUseCase = getUserProfileUseCase;
        this.updateUserProfileUseCase = updateUserProfileUseCase;
    }
    getUserProfile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.params.userId;
                const profile = yield this.getUserProfileUseCase.execute(userId);
                if (!profile) {
                    return res.status(404).json({ message: 'Profile not found' });
                }
                res.status(200).json(profile);
            }
            catch (error) {
                console.error('Error retrieving user profile:', error);
                res.status(500).json({ error: 'Error retrieving user profile' });
            }
        });
    }
    updateUserProfile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.params.userId;
                const profileData = req.body;
                if (req.files && 'profileImage' in req.files) {
                    const file = req.files['profileImage'][0];
                    profileData.profileImage = `/uploads/user/profile/${file.filename}`;
                }
                const updatedProfile = yield this.updateUserProfileUseCase.execute(userId, profileData);
                res.status(200).json(updatedProfile);
            }
            catch (error) {
                console.error('Error updating user profile:', error);
                res.status(500).json({ error: 'Error updating user profile' });
            }
        });
    }
    updateUserProjects(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.params.userId;
                const { projects } = req.body;
                const updatedProfile = yield this.updateUserProfileUseCase.execute(userId, { projects });
                res.status(200).json(updatedProfile);
            }
            catch (error) {
                console.error('Error updating user projects:', error);
                res.status(500).json({ error: 'Error updating user projects' });
            }
        });
    }
    updateUserCertificates(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = req.params.userId;
                const files = ((_a = req.files) === null || _a === void 0 ? void 0 : _a['certificateImage']) || [];
                let certificateDetails;
                try {
                    certificateDetails = JSON.parse(req.body.certificateDetails || '[]');
                    if (!Array.isArray(certificateDetails)) {
                        throw new Error('certificateDetails must be an array');
                    }
                }
                catch (error) {
                    console.error('Error parsing certificateDetails:', error);
                    return res.status(400).json({ error: 'Invalid certificateDetails format' });
                }
                const certificates = certificateDetails.map((details, index) => {
                    const file = files[index]; // Map the correct file for each certificate
                    return Object.assign(Object.assign({}, details), { imageUrl: file ? `/uploads/user/certificates/${file.filename}` : details.imageUrl });
                });
                const updatedProfile = yield this.updateUserProfileUseCase.execute(userId, { certificates });
                res.status(200).json({ message: 'Certificates updated successfully', updatedProfile });
            }
            catch (error) {
                console.error('Error updating user certificates:', error);
                res.status(500).json({ error: 'Error updating user certificates' });
            }
        });
    }
    updateUserExperiences(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.params.userId;
                const { experiences } = req.body;
                const updatedProfile = yield this.updateUserProfileUseCase.execute(userId, { experiences });
                res.status(200).json(updatedProfile);
            }
            catch (error) {
                console.error('Error updating user experiences:', error);
                res.status(500).json({ error: 'Error updating user experiences' });
            }
        });
    }
    updateUserResume(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.params.userId;
                if (!req.file) {
                    return res.status(400).json({ error: 'No resume file uploaded' });
                }
                const resumePath = `/uploads/user/resume/${req.file.filename}`;
                const updatedProfile = yield this.updateUserProfileUseCase.execute(userId, { resume: resumePath });
                res.status(200).json(updatedProfile);
            }
            catch (error) {
                console.error('Error updating user resume:', error);
                res.status(500).json({ error: 'Error updating user resume' });
            }
        });
    }
};
exports.ProfileController = ProfileController;
exports.ProfileController = ProfileController = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.default.GetUserProfileUseCase)),
    __param(1, (0, inversify_1.inject)(types_1.default.UpdateUserProfileUseCase)),
    __metadata("design:paramtypes", [GetUserProfileUseCase_1.GetUserProfileUseCase,
        UpdateUserProfileUseCase_1.UpdateUserProfileUseCase])
], ProfileController);
