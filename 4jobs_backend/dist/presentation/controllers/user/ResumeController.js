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
exports.ResumeController = void 0;
const inversify_1 = require("inversify");
const types_1 = __importDefault(require("../../../types"));
const GenerateResumeUseCase_1 = require("../../../application/usecases/user/GenerateResumeUseCase");
let ResumeController = class ResumeController {
    constructor(generateResumeUseCase) {
        this.generateResumeUseCase = generateResumeUseCase;
    }
    generateResume(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const resumeData = req.body;
                if (!resumeData.userId) {
                    res.status(400).json({ error: "User ID is required" });
                    return;
                }
                const pdfBuffer = yield this.generateResumeUseCase.execute(resumeData);
                const base64Pdf = pdfBuffer.toString('base64');
                res.json({ pdfData: base64Pdf });
            }
            catch (error) {
                console.error("Error generating resume:", error);
                res.status(500).json({ error: "Failed to generate resume" });
            }
        });
    }
};
exports.ResumeController = ResumeController;
exports.ResumeController = ResumeController = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.default.GenerateResumeUseCase)),
    __metadata("design:paramtypes", [GenerateResumeUseCase_1.GenerateResumeUseCase])
], ResumeController);
