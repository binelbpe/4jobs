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
                $or: [{ requester: userId }, { recipient: userId }],
                status: { $in: ['accepted', 'pending'] }
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
            const pendingConnections = yield ConnectionModel_1.ConnectionModel.find({
                $or: [
                    { requester: userId, status: 'pending' },
                    { recipient: userId, status: 'pending' }
                ]
            });
            const pendingConnectionMap = new Map(pendingConnections.map(conn => [
                conn.requester.toString() === userId ? conn.recipient.toString() : conn.requester.toString(),
                conn.requester.toString() === userId ? 'sent' : 'received'
            ]));
            return recommendedUsers.map((user) => ({
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                profileImage: user.profileImage,
                connectionStatus: this.mapConnectionStatus(pendingConnectionMap.get(user._id.toString()))
            }));
        });
    }
    getConnectionProfile(connectionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield UserModel_1.UserModel.findById(connectionId);
            return user ? this.mapUserToEntity(user) : null;
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
            return this.mapConnectionToEntity(savedConnection);
        });
    }
    getConnectionStatus(requesterId, recipientId) {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = yield ConnectionModel_1.ConnectionModel.findOne({
                $or: [
                    { requester: requesterId, recipient: recipientId },
                    { requester: recipientId, recipient: requesterId }
                ],
                status: { $in: ['pending', 'accepted'] }
            });
            return connection ? this.mapConnectionToEntity(connection) : null;
        });
    }
    getRequests(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const connections = yield ConnectionModel_1.ConnectionModel.find({ recipient: userId, status: 'pending' })
                .populate('requester', 'name profileImage headline bio');
            return connections.map(this.mapConnectionRequestToEntity);
        });
    }
    getConnectionById(connectionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = yield ConnectionModel_1.ConnectionModel.findById(connectionId);
            return connection ? this.mapConnectionToEntity(connection) : null;
        });
    }
    updateConnectionStatus(connectionId, status) {
        return __awaiter(this, void 0, void 0, function* () {
            const updatedConnection = yield ConnectionModel_1.ConnectionModel.findByIdAndUpdate(connectionId, { status }, { new: true });
            if (!updatedConnection) {
                throw new Error('Connection not found');
            }
            console.log("updatedConnection", updatedConnection);
            return this.mapConnectionToEntity(updatedConnection);
        });
    }
    mapUserToEntity(user) {
        return {
            id: user._id.toString(),
            email: user.email,
            password: user.password,
            phone: user.phone,
            name: user.name,
            role: user.role,
            isAdmin: user.isAdmin,
            appliedJobs: user.appliedJobs,
            bio: user.bio,
            about: user.about,
            experiences: user.experiences,
            projects: user.projects,
            certificates: user.certificates,
            skills: user.skills,
            profileImage: user.profileImage,
            dateOfBirth: user.dateOfBirth,
            gender: user.gender,
            resume: user.resume,
            isBlocked: user.isBlocked,
        };
    }
    mapConnectionToEntity(connection) {
        return {
            id: connection._id.toString(),
            requesterId: connection.requester.toString(),
            recipientId: connection.recipient.toString(),
            status: connection.status,
            createdAt: connection.createdAt
        };
    }
    mapConnectionRequestToEntity(connection) {
        return {
            id: connection._id.toString(),
            requester: {
                id: connection.requester._id.toString(),
                name: connection.requester.name,
                profileImage: connection.requester.profileImage || '',
                headline: connection.requester.about || '',
                bio: connection.requester.bio || '',
            },
            status: connection.status || ''
        };
    }
    mapConnectionStatus(status) {
        if (status === 'sent' || status === 'received') {
            return 'pending';
        }
        return 'none';
    }
    getConnections(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const connections = yield ConnectionModel_1.ConnectionModel.find({
                $or: [{ requester: userId }, { recipient: userId }],
                status: 'accepted'
            }).populate('requester recipient', 'name profileImage');
            return connections.map(conn => conn.requester._id.toString() === userId ? conn.recipient : conn.requester);
        });
    }
    getConnectionRequestsALL(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return ConnectionModel_1.ConnectionModel.find({
                recipient: userId,
                status: 'pending'
            }).populate('requester', 'name profileImage');
        });
    }
    deleteConnection(connectionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const deletedConnection = yield ConnectionModel_1.ConnectionModel.findByIdAndDelete(connectionId);
            return deletedConnection ? this.mapConnectionToEntity(deletedConnection) : null;
        });
    }
    searchConnections(userId, query) {
        return __awaiter(this, void 0, void 0, function* () {
            const connections = yield this.getConnections(userId);
            const connectionIds = connections.map(conn => conn._id);
            return UserModel_1.UserModel.find({
                _id: { $in: connectionIds },
                name: { $regex: query, $options: 'i' }
            }).select('name profileImage');
        });
    }
};
exports.MongoConnectionRepository = MongoConnectionRepository;
exports.MongoConnectionRepository = MongoConnectionRepository = __decorate([
    (0, inversify_1.injectable)()
], MongoConnectionRepository);
