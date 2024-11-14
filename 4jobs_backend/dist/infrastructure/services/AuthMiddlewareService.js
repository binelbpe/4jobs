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
exports.AuthMiddlewareService = void 0;
const inversify_1 = require("inversify");
const JwtAuthService_1 = require("./JwtAuthService");
const UserModel_1 = require("../database/mongoose/models/UserModel");
let AuthMiddlewareService = class AuthMiddlewareService {
    constructor() {
        this.jwtService = new JwtAuthService_1.JwtAuthService(process.env.JWT_SECRET);
    }
    verifyToken(token) {
        return this.jwtService.verifyToken(token);
    }
    findUserById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return UserModel_1.UserModel.findById(id).lean();
        });
    }
    generateToken(user) {
        return this.jwtService.generateToken(user);
    }
};
exports.AuthMiddlewareService = AuthMiddlewareService;
exports.AuthMiddlewareService = AuthMiddlewareService = __decorate([
    (0, inversify_1.injectable)(),
    __metadata("design:paramtypes", [])
], AuthMiddlewareService);
