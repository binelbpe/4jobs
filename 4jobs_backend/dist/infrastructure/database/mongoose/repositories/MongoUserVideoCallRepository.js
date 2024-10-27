"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
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
exports.MongoUserVideoCallRepository = void 0;
const inversify_1 = require("inversify");
const UserVideoCall_1 = require("../../../../domain/entities/UserVideoCall");
const UserVideoCallModel_1 = require("../models/UserVideoCallModel");
let MongoUserVideoCallRepository = class MongoUserVideoCallRepository {
    create(callerId, recipientId) {
        return __awaiter(this, void 0, void 0, function* () {
            const videoCall = new UserVideoCallModel_1.UserVideoCallModel({
                callerId,
                recipientId,
                status: 'pending',
                mediaStatus: { audio: true, video: true },
                expiresAt: new Date(Date.now() + 30000) // 30 seconds expiry
            });
            yield videoCall.save();
            return this.mapToEntity(videoCall);
        });
    }
    updateStatus(callId, status) {
        return __awaiter(this, void 0, void 0, function* () {
            const videoCall = yield UserVideoCallModel_1.UserVideoCallModel.findByIdAndUpdate(callId, Object.assign({ status, updatedAt: new Date() }, (status === 'accepted' && { expiresAt: new Date(Date.now() + 3600000) }) // 1 hour
            ), { new: true });
            if (!videoCall) {
                throw new Error('Video call not found');
            }
            return this.mapToEntity(videoCall);
        });
    }
    getActiveCall(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const videoCall = yield UserVideoCallModel_1.UserVideoCallModel.findOne({
                $or: [{ callerId: userId }, { recipientId: userId }],
                status: { $in: ['pending', 'accepted'] },
            });
            return videoCall ? this.mapToEntity(videoCall) : null;
        });
    }
    mapToEntity(model) {
        return new UserVideoCall_1.UserVideoCall(model._id.toString(), model.callerId, model.recipientId, model.status, model.mediaStatus || { audio: true, video: true }, // Default media status if not set
        model.createdAt, model.updatedAt, model.expiresAt || new Date(model.createdAt.getTime() + 30000) // Default expiry if not set
        );
    }
};
exports.MongoUserVideoCallRepository = MongoUserVideoCallRepository;
exports.MongoUserVideoCallRepository = MongoUserVideoCallRepository = __decorate([
    (0, inversify_1.injectable)()
], MongoUserVideoCallRepository);
