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
            var _a, _b;
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
            // Split the skills string into an array and create case-insensitive regex patterns
            const userSkills = user.skills && user.skills[0] ? user.skills[0].split(',').map((skill) => skill.trim()) : [];
            const skillPatterns = userSkills.map((skill) => new RegExp(skill, 'i'));
            const recommendedUsers = yield UserModel_1.UserModel.find({
                _id: { $nin: [userId, ...uniqueConnectedUserIds] },
                isAdmin: { $ne: true },
                isBlocked: { $ne: true },
                $or: [
                    { skills: { $elemMatch: { $regex: skillPatterns.map((pattern) => pattern.source).join('|'), $options: 'i' } } },
                    { 'experiences.title': { $in: ((_a = user.experiences) === null || _a === void 0 ? void 0 : _a.map((exp) => new RegExp(exp.title, 'i'))) || [] } },
                    { 'experiences.company': { $in: ((_b = user.experiences) === null || _b === void 0 ? void 0 : _b.map((exp) => new RegExp(exp.company, 'i'))) || [] } }
                ]
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
            return recommendedUsers.map((recommendedUser) => ({
                id: recommendedUser._id.toString(),
                name: recommendedUser.name,
                email: recommendedUser.email,
                profileImage: recommendedUser.profileImage || '',
                connectionStatus: this.mapConnectionStatus(pendingConnectionMap.get(recommendedUser._id.toString())),
                matchingCriteria: this.getMatchingCriteria(user, recommendedUser)
            }));
        });
    }
    getMatchingCriteria(currentUser, recommendedUser) {
        var _a;
        const matchingCriteria = [];
        // Split the skills strings into arrays
        const currentUserSkills = currentUser.skills && currentUser.skills[0] ? currentUser.skills[0].split(',').map((s) => s.trim().toLowerCase()) : [];
        const recommendedUserSkills = recommendedUser.skills && recommendedUser.skills[0] ? recommendedUser.skills[0].split(',').map((s) => s.trim().toLowerCase()) : [];
        // Check for matching skills (case-insensitive)
        const matchingSkills = currentUserSkills.filter(skill => recommendedUserSkills.includes(skill));
        if (matchingSkills.length > 0) {
            matchingCriteria.push(`Matching skills: ${matchingSkills.join(', ')}`);
        }
        // Check for matching experience titles or companies (case-insensitive)
        (_a = currentUser.experiences) === null || _a === void 0 ? void 0 : _a.forEach((exp) => {
            var _a;
            const matchingExperience = (_a = recommendedUser.experiences) === null || _a === void 0 ? void 0 : _a.find((recExp) => recExp.title.toLowerCase().includes(exp.title.toLowerCase()) ||
                recExp.company.toLowerCase().includes(exp.company.toLowerCase()) ||
                exp.title.toLowerCase().includes(recExp.title.toLowerCase()) ||
                exp.company.toLowerCase().includes(recExp.company.toLowerCase()));
            if (matchingExperience) {
                matchingCriteria.push(`Similar experience: ${matchingExperience.title} at ${matchingExperience.company}`);
            }
        });
        return matchingCriteria;
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
    deleteConnection(userId, connectionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = yield ConnectionModel_1.ConnectionModel.findOneAndDelete({
                $or: [
                    { requester: userId, recipient: connectionId },
                    { requester: connectionId, recipient: userId }
                ]
            });
            return connection ? this.mapConnectionToEntity(connection) : null; // Return deleted connection or null
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
