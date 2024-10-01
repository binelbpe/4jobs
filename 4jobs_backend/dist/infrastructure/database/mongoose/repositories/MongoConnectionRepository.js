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
exports.MongoConnectionRepository = void 0;
const inversify_1 = require("inversify");
const ConnectionModel_1 = require("../models/ConnectionModel");
const UserModel_1 = require("../models/UserModel");
let MongoConnectionRepository = class MongoConnectionRepository {
    getRecommendations(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield UserModel_1.UserModel.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }
            const connections = yield ConnectionModel_1.ConnectionModel.find({
                $or: [{ requester: userId }, { recipient: userId }]
            });
            const connectedUserIds = connections.flatMap((conn) => [
                conn.requester.toString(),
                conn.recipient.toString()
            ]);
            const uniqueConnectedUserIds = [...new Set(connectedUserIds)].filter(id => id !== userId);
            const recommendedUsers = yield UserModel_1.UserModel.find({
                _id: { $nin: [userId, ...uniqueConnectedUserIds] },
                isAdmin: { $ne: true },
            }).limit(10);
            const connectionMap = new Map(connections.map(conn => [
                conn.requester.toString() === userId ? conn.recipient.toString() : conn.requester.toString(),
                conn.status
            ]));
            const recommendations = recommendedUsers.map((user) => {
                const recommendedUserId = user._id.toString();
                let connectionStatus = 'none';
                if (connectionMap.has(recommendedUserId)) {
                    connectionStatus = connectionMap.get(recommendedUserId);
                }
                return {
                    id: recommendedUserId,
                    name: user.name,
                    email: user.email,
                    profileImage: user.profileImage,
                    connectionStatus
                };
            });
            return recommendations;
        });
    }
    createConnectionRequest(requesterId, recipientId) {
        return __awaiter(this, void 0, void 0, function* () {
            const newConnection = new ConnectionModel_1.ConnectionModel({
                requester: requesterId,
                recipient: recipientId,
                status: 'pending'
            });
            const savedConnection = yield newConnection.save();
            return {
                id: savedConnection._id.toString(),
                requesterId: savedConnection.requester.toString(),
                recipientId: savedConnection.recipient.toString(),
                status: savedConnection.status,
                createdAt: savedConnection.createdAt
            };
        });
    }
    getConnectionStatus(requesterId, recipientId) {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = yield ConnectionModel_1.ConnectionModel.findOne({
                $or: [
                    { requester: requesterId, recipient: recipientId },
                    { requester: recipientId, recipient: requesterId }
                ]
            });
            if (!connection) {
                return null;
            }
            return {
                id: connection._id.toString(),
                requesterId: connection.requester.toString(),
                recipientId: connection.recipient.toString(),
                status: connection.status,
                createdAt: connection.createdAt
            };
        });
    }
};
exports.MongoConnectionRepository = MongoConnectionRepository;
exports.MongoConnectionRepository = MongoConnectionRepository = __decorate([
    (0, inversify_1.injectable)()
], MongoConnectionRepository);
