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
exports.UserVideoCallUseCase = void 0;
const inversify_1 = require("inversify");
const types_1 = __importDefault(require("../../../types"));
let UserVideoCallUseCase = class UserVideoCallUseCase {
    constructor(userVideoCallRepository) {
        this.userVideoCallRepository = userVideoCallRepository;
    }
    initiateCall(callerId, recipientId) {
        return __awaiter(this, void 0, void 0, function* () {
            const activeCall = yield this.userVideoCallRepository.getActiveCall(callerId);
            if (activeCall) {
                console.log(`[VIDEO CALL] User ${callerId} already has an active call. Ending previous call.`);
                yield this.endCall(activeCall.id);
            }
            // Create a new video call
            const newCall = yield this.userVideoCallRepository.create(callerId, recipientId);
            // Emit event to notify the recipient about the incoming call
            // This part can be handled in the socket server
            return newCall;
        });
    }
    respondToCall(callId, status) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.userVideoCallRepository.updateStatus(callId, status);
        });
    }
    endCall(callId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.userVideoCallRepository.updateStatus(callId, 'ended');
        });
    }
    getActiveCall(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.userVideoCallRepository.getActiveCall(userId);
        });
    }
};
exports.UserVideoCallUseCase = UserVideoCallUseCase;
exports.UserVideoCallUseCase = UserVideoCallUseCase = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.default.IUserVideoCallRepository)),
    __metadata("design:paramtypes", [Object])
], UserVideoCallUseCase);
